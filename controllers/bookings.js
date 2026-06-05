const Booking = require('../models/booking');
const Listing = require('../models/listing');

module.exports.bookListing = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body.booking;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }

    if (listing.owner.equals(req.user._id)) {
        req.flash('error', 'You cannot book your own listing!');
        return res.redirect(`/listings/${id}`);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        req.flash('error', 'Invalid check-in or check-out dates!');
        return res.redirect(`/listings/${id}`);
    }

    if (checkInDate < today) {
        req.flash('error', 'Check-in date cannot be in the past!');
        return res.redirect(`/listings/${id}`);
    }

    if (checkInDate >= checkOutDate) {
        req.flash('error', 'Check-out date must be after check-in date!');
        return res.redirect(`/listings/${id}`);
    }

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
        listing: id,
        status: { $in: ['confirmed', 'pending'] },
        $or: [
            { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
        ]
    });

    if (overlapping) {
        req.flash('error', 'These dates are already booked! Please select different dates.');
        return res.redirect(`/listings/${id}`);
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const basePrice = listing.price * nights;
    const fee = basePrice * 0.14;
    const totalPrice = Math.round(basePrice + fee);

    const booking = new Booking({
        listing: id,
        guest: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: Number(guests),
        totalPrice,
        status: 'confirmed'
    });

    await booking.save();
    req.flash('success', 'Booking confirmed successfully!');
    res.redirect('/bookings/trips');
};

module.exports.getTrips = async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate({
            path: 'listing',
            populate: { path: 'owner' }
        })
        .sort({ checkIn: 1 });

    res.render('bookings/trips', { bookings });
};

module.exports.getHosting = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);

    const bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate('listing')
        .populate('guest')
        .sort({ checkIn: 1 });

    res.render('bookings/hosting', { bookings });
};

module.exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('listing');

    if (!booking) {
        req.flash('error', 'Booking not found!');
        return res.redirect('/bookings/trips');
    }

    // Only guest or host can cancel
    const isGuest = booking.guest.equals(req.user._id);
    const isHost = booking.listing.owner.equals(req.user._id);

    if (!isGuest && !isHost) {
        req.flash('error', 'You do not have permission to cancel this booking.');
        return res.redirect('/listings');
    }

    booking.status = 'cancelled';
    await booking.save();

    req.flash('success', 'Booking has been cancelled.');
    res.redirect(req.headers.referer || '/bookings/trips');
};
