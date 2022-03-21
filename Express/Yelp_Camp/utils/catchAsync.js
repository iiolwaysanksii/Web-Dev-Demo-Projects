module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

//Errors that occur in synchronous code inside route handlers and middleware require no extra work. 
//If synchronous code throws an error, then Express will catch and process it.
//to throw error -> throw new ExpressError(msg, code) which is our custom error handler

//For errors returned from asynchronous functions invoked by route handlers and middleware, 
//you must pass them to the next() function, where Express will catch and process them. 

//HOW THIS UTILITY MODULE WORKS
//if async and promise is involved, we have to wrap code in try and catch(e), 
//inside catch(e), we call next(e), this invoked our cutom error handler ExpressError, 
//however writing try and catch for every async express/mongoose call is tedius task and repetetive, 
//so we wrap the whole process of express and mongoose aysnc function inside this utility call, i.e., catchAsync()
//which simply returns the same function but with a catch attached to it, and hence every async call is handled


//In express 5, we won't have to do this process for async functions, it's in alpha phase as of yet


//MORE ON Error Handling Express