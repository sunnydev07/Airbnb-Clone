const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError.js');
const wrapAsync = require('../utils/wrapAsync.js');
const { listingSchema, reviewSchema } = require('../Schema.js');
const Listing = require('../models/listing');
const Review = require('../models/review');
const { isLoggedIn, isOwner } = require('../middleware.js');
const lisitngController= require('../controllers/listings.js');

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};



// index route
router.get('/', wrapAsync(lisitngController.index));

// new route
router.get('/createNew', isLoggedIn ,wrapAsync(lisitngController.renderNewForm));

// show/update/delete routes
router.route('/:id').get(wrapAsync(lisitngController.showListing))
.put(isLoggedIn,isOwner, wrapAsync(lisitngController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(lisitngController.deleteListing));

// router.get('/:id', wrapAsync(lisitngController.showListing));

// edit route
router.get('/:id/edit',isLoggedIn, isOwner, wrapAsync(lisitngController.renderEditForm));

// create route
router.post('/add',isLoggedIn, validateListing, wrapAsync(lisitngController.addListing));


module.exports = router;