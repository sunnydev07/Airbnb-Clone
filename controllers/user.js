const User = require('../models/user');
const Listing = require('../models/listing');
const { isDatabaseConnected } = require('../utils/database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const normalizeImageUrl = (listing) => {
  if (!listing || !listing.image || !listing.image.url) return listing;
  const url = listing.image.url;
  const isAbsolute = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  if (!isAbsolute) {
    listing.image.url = `/uploads/${url}`;
  }
  return listing;
};

module.exports.renderSignupForm = (req,res)=>{
    res.render('users/signup');
};
module.exports.signup = async(req,res)=>{
   try{
     if (!isDatabaseConnected()) {
      req.flash('error', 'Database is not connected. Please configure ATLASDB_URL before signing up.');
      return res.redirect('/signup');
     }
     let {username, email, password} = req.body;
     const newUser = new User({username, email});
     const registeredUser = await User.register(newUser, password);
     // Auto-login the user after signup
     req.login(registeredUser, (err)=>{
       if(err) return next(err);
       req.flash('success', 'Welcome to Airbnb! You have signed up successfully.');
       res.redirect('/listings');
     })
   }catch(e){
     req.flash('error', e.message);
     res.redirect('/signup');
   }
};
module.exports.renderLoginForm =  (req,res)=>{
  res.render('users/login');
};
module.exports.login = (req,res)=>{
    req.flash('success', 'Welcome back! You are logged in.');
    let redirectUrl = res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.flash('success', 'You have been logged out.');
        res.redirect('/listings');
    });
};

module.exports.renderProfile = async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.render('users/profile', {
      ownedListings: [],
      recentListings: [],
      profileStats: {
        listingCount: 0,
        reviewCount: 0,
        averagePrice: 0,
        memberSince: req.user && req.user._id && typeof req.user._id.getTimestamp === 'function'
          ? req.user._id.getTimestamp()
          : null,
        totalViews: 0,
        totalRevenue: 0,
        bookingCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentReviews: []
      }
    });
  }

  const ownedListings = await Listing.find({ owner: req.user._id }).sort({ _id: -1 }).lean();
  ownedListings.forEach(normalizeImageUrl);

  const myListingIds = ownedListings.map(l => l._id);

  // Get listings with reviews populated
  const listingsWithReviews = await Listing.find({ owner: req.user._id })
    .populate({
      path: 'reviews',
      populate: { path: 'author' }
    });

  let totalViews = 0;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let allReviewsList = [];

  listingsWithReviews.forEach(l => {
    totalViews += l.viewCount || 0;
    if (l.reviews) {
      l.reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingDistribution[r.rating]++;
        }
        allReviewsList.push({
          ...r.toObject(),
          listingTitle: l.title,
          listingId: l._id
        });
      });
    }
  });

  allReviewsList.sort((a, b) => b.createdAt - a.createdAt);
  const recentReviews = allReviewsList.slice(0, 5);

  // confirmed bookings info
  const Booking = require('../models/booking');
  const confirmedBookings = await Booking.find({
    listing: { $in: myListingIds },
    status: 'confirmed'
  });

  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const bookingCount = confirmedBookings.length;

  const totalReviewsCount = allReviewsList.length;
  const pricedListings = ownedListings
    .map((listing) => Number(listing.price))
    .filter((price) => Number.isFinite(price));
  const averagePrice = pricedListings.length
    ? Math.round(pricedListings.reduce((sum, price) => sum + price, 0) / pricedListings.length)
    : 0;
  const memberSince = req.user._id && typeof req.user._id.getTimestamp === 'function'
    ? req.user._id.getTimestamp()
    : null;

  res.render('users/profile', {
    ownedListings,
    recentListings: ownedListings.slice(0, 3),
    profileStats: {
      listingCount: ownedListings.length,
      reviewCount: totalReviewsCount,
      averagePrice,
      memberSince,
      totalViews,
      totalRevenue,
      bookingCount,
      ratingDistribution,
      recentReviews
    }
  });
};

module.exports.renderForgotForm = (req, res) => {
    res.render('users/forgot');
};

module.exports.sendResetEmail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/forgot');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset/${token}`;

    const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Airbnb Clone Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
              `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
              `${resetUrl}\n\n` +
              `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
        res.redirect('/forgot');
    } catch (err) {
        console.error('Email send error:', err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        req.flash('error', 'Error sending reset email. Please try again later.');
        res.redirect('/forgot');
    }
};

module.exports.renderResetForm = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
    }
    res.render('users/reset', { token: req.params.token });
};

module.exports.resetPassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
    }

    if (req.body.password !== req.body.confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/reset/${req.params.token}`);
    }

    await user.setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.login(user, (err) => {
        if (err) return next(err);
        req.flash('success', 'Success! Your password has been changed.');
        res.redirect('/listings');
    });
};
