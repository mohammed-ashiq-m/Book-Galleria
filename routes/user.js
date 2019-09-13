var express = require('express');
let bcrypt=require('bcrypt-nodejs');
var router = express.Router();
let csrf=require('csurf');
let csrfProtection=csrf();
router.use(csrfProtection);
let dbconnect=require('../dbconfig/db-connect')
let dbConfig=require('../dbconfig/db-connect');
let passport=require('passport');
let CART=require('../cart/cart')
const { check, validationResult } = require('express-validator');

router.get('/profile',isLoggedIn, function (req,res) {
    res.render('user/profile');
});

router.get('/logout',isLoggedIn,function (req,res,next) {
    req.logOut();
    res.redirect('/')
})
router.use('/',notLoggedIn,function (req,res,next) {
    next();
})
router.get('/signup',function (req,res,next){
    let messages=req.flash('error')
    res.render('user/signup',{csrfToken:req.csrfToken(),messages:messages,hasError:messages.length>0})
})
router.get('/signin',function (req,res,next){
    let messages=req.flash('error')
    res.render('user/signin',{csrfToken:req.csrfToken(),messages:messages,hasError:messages.length>0})
})
router.post('/signup',[check('email','Invalid email').isEmail(),check('password','Invalid password.').isLength({min:5})],
    passport.authenticate('local-signup',
        {

            failureRedirect:'/user/signup',
            failureFlash:true
        }),function(req,res,next){
        if(req.session.oldUrl){
            var oldUrl = req.session.oldUrl;
            req.session.oldUrl = null;
            res.redirect(oldUrl);
        }
        else {
            res.redirect('/user/profile')
        }
    }
);
router.post('/signin',[check('email','Invalid email').isEmail(),check('password','Invalid password.').isLength({min:5})],
    passport.authenticate('local-signin',
        {
            successRedirect:'/user/profile',
            failureRedirect:'/user/signin',
            failureFlash:true
        }
    )


);


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req,res,next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

module.exports = router;
