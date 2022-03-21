const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

//inside the route folder, this route is already wrapped inside catchAsync utility, that'll take care if there's a error
//but to enhance user experience, we also put a try and catch, that'll simply flash the user a message, and they can try registering again
//without leaving the page
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {   //this method is also coming from passport
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    // --> what is this returnTo, check app.use() of the app.js file, the route setup section
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();   //this method is coming from passport
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}