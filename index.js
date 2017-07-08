const express = require('express');
const expressValidator = require('express-validator');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const models = require('./models');

var app = express();

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');
app.use(express.static('./'));;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

// *** sets the session ***
app.use(session({ secret: 'chit chat', cookie: { maxAge: 300000 }}));

// *** this is the index page, which is set to destroy the session authenication for logging out ***
app.get('/', function(req, res) {
  req.session.authenticated = false;
  res.redirect('login');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.get('/profile', function(req, res) {
  if (req.session.authenticated === true) {
  res.render('profile', {username:req.session.username});
} else {
  res.redirect('login');
}
});

// *** the home page displays a feed of posts and first checks for an authenticated session ***
app.get('/home', function(req, res) {
  if (req.session.authenticated === true) {
    models.post.findAll().then(function(posts) {
      res.render('home', {posts:posts, username:req.session.username});
    });
  } else {
    res.redirect('login');
  };
});


// *** Home page without session authenication ***
// app.get('/home', function(req, res) {
//   models.post.findAll().then(function(post) {
//     res.render('home', {posts:post})
//   });
// });


// *** Testing the form inputs and they work yayay! ***
// app.post('/signup', function(req, res) {
//   var userPacket = {
//     userName: req.body.userName,
//     passWord: req.body.passWord,
//     confirmPassword: req.body.confirmPassword
//   }
//   console.log(userPacket);
// });

app.post('/login', function(req, res) {
  var username = req.body.username; // sets username and password from user's input
  var password = req.body.password;
  var checkUser = models.user.findOne({ where: {username: username}, password: password}).then(function(user){ // checks the user table for correct user/password
    console.log("checkUser is: " + checkUser);
    if (user.username !== username || user.password !== password) {
      res.redirect('/login'); // first checks for incorrect info and redirects
      console.log("user not logged in");
    } else if (user.username === username && user.password === password) {
      req.session.authenticated = true; // directs the user to home if correct info is found
      req.session.username = username;
      res.redirect('/home');
      console.log("user logged in");
    } else {
      res.redirect('/login'); // anything else I couldn't think of? hehe
      console.log("user not logged in");
    };
});
});

app.post('/signup', function(req, res) {
  if (req.body.passWord !== req.body.confirmPassword) {
    res.redirect('signup')
  } else {
  const user = models.user.build({ // builds to the user table
    username: req.body.userName,
    password: req.body.passWord
  });
  user.save();
  req.session.authenticated = true; // sets the session username
  req.session.username = req.body.userName;
  res.redirect('home');
}
});

app.post('/home', function(req, res) {
  const post = models.post.build({ // builds to the posts table
    postbody: req.body.postInput,
    postauthor: req.session.username
  });
  post.save();
res.redirect('home');
});

app.post('/home/likepost', function(req, res) {
  const updatePost = models.post.update({
    likedby: req.session.username},
    {where: {id: req.body.likeButton}
  });
  // res.redirect('home'); doesn't work and I don't know why! 
});





app.listen(3000, function(req, res) {
  console.log("Chitter connected");
});






// *** Intentional whitespace ***
