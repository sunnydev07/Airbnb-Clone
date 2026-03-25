const express = require('express');
const router = express.Router({mergeParams:true});
const ExpressError = require('../utils/ExpressError.js');
const wrapAsync = require('../utils/wrapAsync.js');
const { listingSchema, reviewSchema } = require('../Schema.js');
const Review = require('../models/review');
const Listing = require('../models/listing');
const { isLoggedIn, isreviewAuthor, validateReview } = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');


// review create route
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// review delete route
router.delete('/:reviewId', isLoggedIn,isreviewAuthor, wrapAsync(reviewController.deleteReview));
module.exports = router;