const User = require('../models/user');
const Listing = require('../models/listing');
const { isDatabaseConnected } = require('../utils/database');

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
}

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
          : null
      }
    });
  }

  const ownedListings = await Listing.find({ owner: req.user._id }).sort({ _id: -1 }).lean();
  ownedListings.forEach(normalizeImageUrl);

  const totalReviews = ownedListings.reduce((sum, listing) => {
    return sum + (Array.isArray(listing.reviews) ? listing.reviews.length : 0);
  }, 0);
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
      reviewCount: totalReviews,
      averagePrice,
      memberSince
    }
  });
};
