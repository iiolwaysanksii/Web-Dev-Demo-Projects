const express = require('express');
const router = express.Router({ mergeParams: true });		
// by default express router keeps the parameter from prefixes (which is defined in another file) 
// and parameter in this file separate, so if we don't specify mergeParams:true, 
// it won't merge the whole request "/campground/:id/reviwes/:reviewId" into one
// and we won't be able to retrieve any campground in this file, because we won't have access to it,
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;