const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError.js');
const wrapAsync = require('../utils/wrapAsync.js');
const { listingSchema } = require('../Schema.js');
const { isLoggedIn, isOwner } = require('../middleware.js');
const lisitngController = require('../controllers/listings.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');

const upload = multer({ storage });

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    next();
};

// index route
router.get('/', wrapAsync(lisitngController.index));

// new route
router.get('/createNew', isLoggedIn, wrapAsync(lisitngController.renderNewForm));

// create route (must come before /:id routes)
router.post('/add', isLoggedIn, upload.single('image'),wrapAsync(lisitngController.addListing));

// edit route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(lisitngController.renderEditForm));

// show/update/delete routes
router
    .route('/:id')
    .get(wrapAsync(lisitngController.showListing))
    .put(isLoggedIn, isOwner, upload.single('image'), wrapAsync(lisitngController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(lisitngController.deleteListing));

module.exports = router;
