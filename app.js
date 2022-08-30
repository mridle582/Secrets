require('dotenv').config();

const port = process.env.PORT;

const express = require('express');
// eslint-disable-next-line no-unused-vars
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(session({
  secret: process.env.PASSPORT_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect('mongodb://0.0.0.0:27017/userDB');
mongoose.connect(`${process.env.MONGODB_URL}/userDB`);

const userSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  provider: String,
  email: String,
  password: String,
  secret: String,
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'username',
});
userSchema.plugin(findOrCreate);

// eslint-disable-next-line new-cap
const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, {
      id: user.id,
      username: user.username,
    });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  // callbackURL: 'http://localhost:3000/auth/google/secrets',
  callbackURL: process.env.GOOGLE_CALLBACK,
},
(accessToken, refreshToken, profile, cb) => {
  User.findOrCreate({
    username: profile.id,
  }, {
    provider: 'google',
    email: profile._json.email,
  }, (err, user) => {
    return cb(err, user);
  });
},
));

passport.use(new FacebookStrategy({
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  // callbackURL: 'http://localhost:3000/auth/facebook/secrets',
  callbackURL: process.env.FB_CALLBACK,
  profileFields: ['email'],
},
(accessToken, refreshToken, profile, cb) => {
  User.findOrCreate({
    username: profile.id,
  }, {
    provider: 'facebook',
    email: profile._json.email,
  }, (err, user) => {
    return cb(err, user);
  });
},
));


app.get('/', (req, res) => {
  res.render('home');
});


app.get('/login', (req, res) => {
  res.render('login');
});


app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));


app.get('/auth/google/secrets',
    passport.authenticate('google', {
      successRedirect: '/secrets',
      failureRedirect: '/login',
    }),
);


app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email'],
}));


app.get('/auth/facebook/secrets',
    passport.authenticate('facebook', {
      successRedirect: '/secrets',
      failureRedirect: '/login',
    }),
);


app.get('/register', (req, res) => {
  res.render('register');
});


app.get('/secrets', (req, res) => {
  User.find({
    'secret': {
      $ne: null,
    },
  }, (err, secrets) => {
    if (err) {
      console.log(err);
    } else {
      if (secrets) {
        res.render('secrets', {
          usersWithSecrets: secrets,
        });
      } else {
        console.log('No secrets');
      }
    }
  });
});


app.get('/submit', (req, res) => {
    req.isAuthenticated() ? res.render('submit') : res.redirect('/login');
});


app.get('/logout', (req, res) => {
  req.logout((err) => {
        err ? console.log(err) : res.redirect('/');
  });
});


app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
      res.redirect('/login');
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets');
      });
    }
  });
});


app.post('/register', (req, res) => {
  User.register({
    username: req.body.username,
    provider: 'local',
  }, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets');
      });
    }
  });
});


app.post('/submit', (req, res) => {
  const submittedSecret = req.body.secret;
  User.findOne({
    _id: req.user.id,
  }, (err, foundUser) => {
    if (!err) {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(() => {
          res.redirect('secrets');
        });
      } else {
        console.log('User Not Found');
      }
    } else {
      console.log(err);
    }
  });
});


app.listen(port || 3000, () => {
  if (typeof port !== 'undefined') {
    console.log(`Server is running on port ${port}`);
  } else {
    console.log(`Server is running on port 3000`);
  }
});
