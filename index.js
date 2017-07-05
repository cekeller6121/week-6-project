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

app.use(session({ secret: 'chit chat', cookie: { maxAge: 300000 }}));

app.get('/', function(req, res) {
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
  res.render('profile');
} else {
  res.redirect('login');
}
});

app.get('/home', function(req, res) {
  if (req.session.authenticated === true) {
    models.post.findAll().then(function(posts) {
      res.render('home', {posts:posts})
    })
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
//     confirmPassword: req.body.confirmPassword,
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//     email: req.body.email
//   }
//   console.log(userPacket);
// });

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var checkUser = models.user.findOne({ where: {username: username}, password: password}).then(function(user){
    console.log("checkUser is: " + checkUser);
    if (user.username !== username || user.password !== password) {
      res.redirect('/login');
      console.log("user not logged in");
    } else if (user.username === username && user.password === password) {
      req.session.authenticated = true;
      // req.session.displayName = username; *** stores username in the session
      res.redirect('/home');
      console.log("user logged in");
    } else {
      res.redirect('/login');
      console.log("user not logged in");
    };
});
});

app.post('/signup', function(req, res) {
  const user = models.user.build({
    username: req.body.userName,
    password: req.body.passWord,
    firstname: req.body.firstName,
    lastname: req.body.lastName,
    email: req.body.email
  });
  user.save();
  res.redirect('home');
});

app.post('/home', function(req, res) {
  const post = models.post.build({
    postbody: req.body.postInput,
    isliked: false
  });
  post.save();
res.render('home', {posts:post});
});





app.listen(3000, function(req, res) {
  console.log("Chitter connected");
});






// *** Intentional whitespace ***
