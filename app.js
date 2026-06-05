const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo.MongoStore || connectMongo;
const passport = require('passport');
const User = require('./models/user.js');
const LocalStrategy = require('passport-local').Strategy;

// Routes
const listingsRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const bookingsRouter = require('./routes/booking.js');
const messagesRouter = require('./routes/message.js');
const userRoutes = require('./routes/user.js');

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());

const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SECRET_KEY || process.env.SECRRET_KEY;
if (!sessionSecret) {
    throw new Error('FATAL: SECRET_KEY environment variable is not set. Cannot start without a session secret.');
}

let store;
if (dbUrl) {
  store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: sessionSecret
    },
    touchAfter: 24 * 60 * 60
  });

  store.on('error', () => {
    console.log('ERROR in Mongo Session store!');
  });
}

const sessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
      expires: Date.now() + 7*24*60*60*1000,
      maxAge: 7*24*60*60*1000,
      httpOnly: true 
  }
};

if (store) {
  sessionOptions.store = store;
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Custom LocalStrategy to support email or username login
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async(username, password, done) => {
  try {
    const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if(!user) {
      return done(null, false, { message: 'Incorrect username or email.' });
    }
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

// Custom middleware
app.use(async (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    
    if (req.user) {
        try {
            const Conversation = require('./models/conversation');
            const conversations = await Conversation.find({
                participants: req.user._id
            });
            let unreadCount = 0;
            conversations.forEach(conv => {
                conv.messages.forEach(msg => {
                    if (!msg.sender.equals(req.user._id) && !msg.read) {
                        unreadCount++;
                    }
                });
            });
            res.locals.unreadMessagesCount = unreadCount;
        } catch (e) {
            console.error('Error calculating unread messages:', e);
            res.locals.unreadMessagesCount = 0;
        }
    } else {
        res.locals.unreadMessagesCount = 0;
    }
    next();
});

main().catch(err=>console.log(err.message));

async function main(){ 
    if (!dbUrl) {
      console.log('ATLASDB_URL is missing. App started without DB connection.');
      return;
    }
    await mongoose.connect(dbUrl);
    console.log("Connected successfully to DB1!");
}

app.get('/', (req, res) => {
  res.redirect('/listings');
});

app.use('/', userRoutes);
app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/bookings', bookingsRouter);
app.use('/messages', messagesRouter);

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}...`);
});
