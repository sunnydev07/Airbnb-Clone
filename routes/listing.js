const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError.js');
const wrapAsync = require('../utils/wrapAsync.js');
const { listingSchema } = require('../Schema.js');
const { isLoggedIn, isOwner } = require('../middleware.js');
const lisitngController = require('../controllers/listings.js');
const bookingsController = require('../controllers/bookings.js');
const messagesController = require('../controllers/messages.js');
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

// Map view route (MUST be defined before /:id routes)
router.get('/map', wrapAsync(lisitngController.renderMapView));

// create route (must come before /:id routes)
router.post('/add', isLoggedIn, upload.single('image'), validateListing, wrapAsync(lisitngController.addListing));

// book listing route
router.post('/:id/book', isLoggedIn, wrapAsync(bookingsController.bookListing));

// contact host route
router.post('/:id/contact', isLoggedIn, wrapAsync(messagesController.startConversation));

// edit route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(lisitngController.renderEditForm));

// show/update/delete routes
router
    .route('/:id')
    .get(wrapAsync(lisitngController.showListing))
    .put(isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(lisitngController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(lisitngController.deleteListing));

module.exports = router;
