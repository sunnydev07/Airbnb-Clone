const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn } = require('../middleware');
const bookingsController = require('../controllers/bookings');

// All booking routes require authentication
router.use(isLoggedIn);

router.get('/trips', wrapAsync(bookingsController.getTrips));
router.get('/hosting', wrapAsync(bookingsController.getHosting));
router.post('/:bookingId/cancel', wrapAsync(bookingsController.cancelBooking));

module.exports = router;
