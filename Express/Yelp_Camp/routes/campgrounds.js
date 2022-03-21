const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }); //storage is the destination where we store images om cloundinary
//just look up docs for multer, it's easy enough to understand
//what we need it for is to parse image data coming from form, cuz we can't parse it normally
//we are also sending that data with help of a utility CloudinaryStorage (check index.js of cloudinary)
//over to the server of cloundinary, which in turn gives us a url to acces the uploaded data and we store that url in database

const Campground = require('../models/campground');

router.route('/') //This slash will be replaced with the prefix defined in app.js -> /campground
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
//upload.array('array) adds a property "files" on the request object(req.files), 
//which will contain information about the uploaded images that are coming from our form and being stored on cloudinary
//we can now take this req.files and store the relevant information in our database

router.get('/new', isLoggedIn, campgrounds.renderNewForm) // -> /campgrounds/new

router.route('/:id')  // -> /campground/:id
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;