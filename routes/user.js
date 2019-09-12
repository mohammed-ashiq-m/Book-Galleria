var express = require('express');
let bcrypt=require('bcrypt-nodejs');
var router = express.Router();


let csrf=require('csurf');
let dbConfig=require('../dbconfig/db-connect');
let csrfProtection=csrf();
router.use(csrfProtection);

router.get('/profile',isLoggedIn, function (req,res) {
  res.render('user/profile');
});

router.get('/signup',function (req,res) {
  res.render('user/signup',({csrfToken:req.csrfToken}));

});

router.post('/signup',function (req,res) {
  let email=req.body.email;
  let password=req.body.password;
  let encryptedPassword=bcrypt.hashSync(password,bcrypt.genSaltSync(),null);

  dbConfig.get().collection('user').insertOne({email:email,password:encryptedPassword},function (err,data) {
    if(!err){
      res.redirect('/');
    }

  });
});
router.get('/signin',function (req,res) {
  res.render('user/signin',({csrfToken:req.csrfToken}));
});

router.post('/signin',function (req,res) {

  let username=req.body.email;
  let password=req.body.password;

  dbConfig.get().collection('user').findOne({'email':username},function (err,data) {
    if(data){
      console.log(data);
      if(bcrypt.compareSync(password,data.password)){
        res.redirect('/user/profile');
      }else {
        res.end("Password mismatch");
      }
    }else {
      res.end("username and password mismatch");
    }

  });

});

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
