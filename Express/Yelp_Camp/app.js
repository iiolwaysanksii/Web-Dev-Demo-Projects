//REMINDER TO SELF
//Console.log() / console.dir() if you ever feel lost
//Also for npm packages, for any question and information check documentations on npm page

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');  //for the path.join()
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');  //for layout, check npm package docs, also views/layout/boilerplate.ejs
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoDBStore = require("connect-mongo")(session);  //for session store


//------------------------------------------------------------------
//----------------------CONNECTING TO DATABASE----------------------
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
//listener functions
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


//---------------------------------------------------------------
//------------------------APP CONFIGURATION----------------------
const app = express();
app.engine('ejs', ejsMate); //The app.engine() function is used to register the given template engine callback as ext. 
//By default the Express itself will require() the engine based on the file extension.

//The app.set() function is used to assigns the setting name to value.
app.set('view engine', 'ejs'); //sets the view engine to use ejs
app.set('views', path.join(__dirname, 'views')); //A directory or an array of directories for the application's views. 
                                                //If an array, the views are looked up in the order they occur in the array.
                                                //Here the directory is view, so even if we launch the express app from some other directory, 
                                                //it'll look for "view" directory to deploy views

//since app.use() is before any other route, these select few lines will run for every incoming request, think of app.use, app.get and all the other
//routing methods, as switch case, any request keeps falling down while matching, until it is resolved, so order of these methods matter

app.use(express.urlencoded({ extended: true })); //tells the app to parse "req.body" for incoming post requests, by default the field will be empty
app.use(methodOverride('_method')); //alows us to fake put, patch, and delete request on html form side of things, "_method" is added to query string, this term can be anything
app.use(express.static(path.join(__dirname, 'public'))); //by default express doesn't care about public directory,
//stylesheets and javascript that we reference inside <head> element of our page, will be in reference to this public directory
app.use(mongoSanitize({
    replaceWith: '_'
}));


//-----------------------------------------------------------
//------------SESSION CONFIGURATION AND SETUP----------------
const secret = process.env.SECRET || 'iLoveBlackpinkAndSoShouldYou!!'; //session secret used to verify intergerity of session cookies/data
//Warning The default server-side session storage, MemoryStore, is purposely not designed for a production environment. 
//It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.
//So we are using a MongoDB based session store
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60  //refresh session in 24 seconds, basic unit is seconds not ms
});
//listener function
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
//Session Configuation
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        //comment out the above in production, it's to enable https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires in a week ms*sec*min*hour*day
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());    //Flash messages are stored in the session. So, we need to first setup the session before we can use flash.

//-----------------------------------helmet for additional security-----------------------------
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/du3errqmw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Session has to come before passport setup
//----------------------------------------------------------------------
//--------------------------PASSPORT SETUP------------------------------
//Everything is coming from passport, so just check the docs 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());   //how do we store User in session
passport.deserializeUser(User.deserializeUser()); //how do we get it out


//---------------------------------------------------------------------
//------------------ROUTES SETUP---------------------------------------
//This makes info about logged in user and flash message available on all routes, 
//so we don't have to pass these as info to every route ourselves, 
//app.use() is a middleware here and runs for every request
//bcz app.use() here is being defined before any other major route
app.use((req, res, next) => {
    // console.log(req.session);

    //If the current URL of the page is none of the ones in array (which means the user is not coming from these pages), 
    //and the user tries to do something that requires authentication, we know that the isLoggedIn middleware runs, --> (check middleware for it)
    //and redirects the user to the login page, so to provide better user experience, once the user succesfully logs in, 
    //we instead of sending them to home page, send them to the originalURL they came from before logging --> (check the login controller)
    if(!['/','/login', '/logout','/register'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }

    //Note to self: look up what is res.locals on express to understand this better
    res.locals.currentUser = req.user; 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//These will be the prefixes for the routes that are defined in routes folder
app.use('/', userRoutes);   // --> no prefix
app.use('/campgrounds', campgroundRoutes)  // --> /campground prefix
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


//custom error handler, if a error by chance is not resovled or is passed on using "next(err)" from some other middleware, 
//it'll be caught here, express automatically treats it as a error request because of "next(err)", 
//and since app.use() runs for every request, here it catches that request and resolves it
//we can also pass this error to other upcoming middleware(), using the same, next(err), but in this file there's none, so we don't
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;   //if no code, use defult 500
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
