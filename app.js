const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override')
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const listingsRouter = require('./routes/listing.js')
const reviewRouter = require('./routes/review.js');
const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";
const cookieParser = require('cookie-parser');
const flash  = require('connect-flash');
const session  = require('express-session');
const passport = require('passport');
const User = require('./models/user.js');
const userRoutes = require('./routes/user.js');
const LocalStrategy = require('passport-local').Strategy;
app.use(cookieParser());


const sessionOptions = {secret:"mysuperscretkey", resave:false, saveUninitialized:false,
        cookie:{
            expires:Date.now() + 7*24*60*60*1000,
            maxAge:7*24*60*60*1000,
            httpOnly:true 
        }
}
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); // to use persistent login sessions

// Custom LocalStrategy to support email or username login
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async(username, password, done) => {
  try {
    // Try to find user by username first, then by email
    const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if(!user) {
      return done(null, false, { message: 'Incorrect username or email.' });
    }
    // Use passport-local-mongoose authenticate method
    const auth = await user.authenticate(password);
    if(auth.user) {
      return done(null, auth.user);
    } else {
      return done(null, false, { message: 'Incorrect password.' });
    }
  } catch(e) {
    console.error('Auth error:', e);
    return done(null, false, { message: 'Password or username is incorrect' });
  }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{      // middleware to set flash message and currUser in res.locals so that it can be accessed in all views
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
}
);

// app.get('/demouser', async(req,res)=>{
//     let fakeUser = new User({
//         username:"detal-user",
//         email:"fakeuser@gmail.com"
//     });
//     let newUser = await User.register(fakeUser, "helloworld"); // this method is provided by passport-local-mongoose to register a new user and hash the password)
//     res.send(newUser);
// });

main().then(()=>{console.log("Connected successfully to DB1!")}).catch(err=>console.log(err.message));

async function main(){ 
    await mongoose.connect(MONGO_URL);
}

app.get('/', (req, res) => {
  res.redirect('/listings');
});

app.use('/', userRoutes);
app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews',reviewRouter);

// 404 handler
app.use((req,res)=>{
    res.status(404).render('error', {message: 'Page Not Found', statusCode: 404, layout: false});
});

// Error handling middleware (must be last)
app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    console.error('Error:', err);
  if (res.headersSent) {
    return next(err);
  }
    res.status(statusCode).render('error', {message, statusCode, layout: false});
});

app.listen(8080, ()=>{
    console.log('server is listeing on port 8080...');
})