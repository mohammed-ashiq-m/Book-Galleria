var express = require('express');
var router = express.Router();
let passport=require('passport')
let dbconnect=require('../dbconfig/db-connect')
let ObjectID = require('mongodb').ObjectID;
let cart=require('../cart/cart')

/* GET home page. */
router.get('/', function(req, res, next) {
  dbconnect.get().collection('product').find().toArray(function (err, docs) {
    res.render('Shop/index', {title: 'Book-Galleria', products: docs});

  });
});
router.get("/add-to-cart/:id",  function(req,res,next){

  let productId=req.params.id;
  let idString=productId
  let objId = new ObjectID(idString);
  if(!req.session.cart){
    req.session.cart={
      items:{},totalQty:0,totalPrice:0

    }
  }
  dbconnect.get().collection('product').findOne({_id:objId}, function(err,product)
  {
    if(err)
      return err
    if(product)
    {
      req.session.cart= cart.cartAdd(req.session.cart,product,product._id);
      console.log(req.session.cart)
      res.redirect('/')
    }




  })
})
router.get('/reduce-one/:id',  function( req,res,next){
  let productId = req.params.id;
  req.session.cart=cart.reduceOne(req.session.cart,productId);

  res.redirect('/cart');
});
router.get('/remove-all/:id',  function( req,res,next){
  let productId = req.params.id;
  req.session.cart=cart.removeall(req.session.cart,productId);

  res.redirect('/cart');
});
router.get("/cart",function(req ,res,next){

  if(!req.session.cart)
    return  res.render('shop/cart',{products:null})
  else
    res.render('shop/cart',{products:cart.generateArray(req.session.cart),totalPrice:req.session.cart.totalPrice})
})

router.get('/checkout',isLoggedIn, function(req,res,next){
  if(!req.session.cart)
    return res.redirect('/cart');
  var cart = req.session.cart;
  var errMsg = req.flash('error')[0];
  return res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
})
router.post('/checkout',isLoggedIn, function(req,res,next){
  if(!req.session.cart) {
    return res.redirect('/cart');
  }
  var cart = req.session.cart;

  var stripe = require("stripe")(
      "sk_test_pVJhFSD0tie3QmfWqzusM6ib"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: req.body.stripeToken,
    description: "Test Charge"
  }, function(err, charge) {
    if(err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    let order={
      user: req.user,
      cart: req.session.cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    };

    dbconnect.get().collection('orders').insertOne(order);

    req.flash('success', 'Successfully bought product!');
    req.session.cart = null;
    res.redirect('/');

  });
})
module.exports = router;
function isLoggedIn(req,res,next){
  if(req.isAuthenticated())
    return next();
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');

}


module.exports = router;

