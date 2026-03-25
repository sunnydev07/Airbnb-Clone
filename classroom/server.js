const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session  = require('express-session');
const flash = require('connect-flash');
const path = require('path');
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
const sessionOptions = {
    secret:"mysuperscretkey", 
    resave:false, 
    saveUninitialized:true
};
app.use(session(sessionOptions));
app.use(flash());

app.get('/register', (req,res)=>{
    let {name = "Dev"} = req.query;
    req.session.name = name;
    console.log(req.session.name,"Registered!");
    req.flash('success', 'user successfully registered!');
    res.redirect('/welcome');
});
app.get('/welcome', (req,res)=>{
    // res.send(`Welcome ${req.session.name}, you have successfully registered!`);
    res.render('page.ejs', {nam :req.session.name, msg:req.flash('success')});
})

// app.get('/reqcount', (req,res)=>{
//     if(req.session.count){
//         req.session.count ++;
//     }else{
//         req.session.count = 1;
//     }
    
//    if(req.session.count < 5){
//      res.send(`you sent a request ${req.session.count} times`);
//    }else{
//     res.send("you have sent too many requests");
//    }
// });
app.listen(8080, ()=>{
    console.log('listeing on port 8080');
});