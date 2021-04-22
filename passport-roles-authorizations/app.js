// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require("./config")(app);


// session configuration

const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('./db/index');
const DB_URL = 'mongodb://localhost/passport';


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    saveUninitialized: false,
    resave: true,
    store: MongoStore.create({
      mongoUrl: DB_URL
    })
  })
)

// end of session configuration


// passport configuration
// http://www.passportjs.org/docs/configure/
const User = require('./models/User.model');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// passport wants to store as little data as possible in the session so it only uses 
// the id's (or someting else if we would want to implement that) and not the whole 
// user object
// this method is used by passport to put the id of the user into the session
passport.serializeUser((user, done) => {
  done(null, user._id);
})

// this is used to retrieve the user by it's id (that is stored in the session)
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(dbUser => {
      done(null, dbUser)
    })
    .catch(err => {
      done(err);
    })
})

passport.use(
  new LocalStrategy((username, password, done) => {
    // this logic will be executed when we log in
    User.findOne({ username: username })
      .then(userFromDB => {
        if (userFromDB === null) {
          // there is no user with this username
          done(null, false, { message: 'Wrong Credentials' });
        } else if (!bcrypt.compareSync(password, userFromDB.password)) {
          // the password does not match
          done(null, false, { message: 'Wrong Credentials' });
        } else {
          // everything correct - user should be logged in
          done(null, userFromDB);
        }
      })
      .catch(err => {
        next(err);
      })
  })
)

app.use(passport.initialize());
app.use(passport.session());

// end of passport configuration

// passport github login config

const GithubStrategy = require('passport-github').Strategy;
passport.use(
  // these are the credentials that we added / received when we registered the app
  // on github
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: 'http://127.0.0.1:3000/auth/github/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);

      // authentication on github passed we need to check if we have the user
      // with that id now already in the database - if not we need to create it
      User.findOne({ githubId: profile.id })
        .then(userFromDB => {
          if (userFromDB !== null) {
            // pass the user to passport so it can be serialized and it's id put into 
            // the session
            done(null, userFromDB)
          } else {
            // we can log the profile that we receive from the github api
            // console.log(profile);
            User.create({ githubId: profile.id, username: profile.username, avatar: profile._json.avatar_url })
              .then(userFromDB => {
                done(null, userFromDB);
              })
          }
        })
        .catch(err => {
          done(err);
        })
    }
  )
)

// end of passport github login config

// default value for title local
const projectName = "passport";
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)} created with Ironlauncher`;

// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const auth = require("./routes/auth");
app.use("/", auth);

const rooms = require("./routes/rooms");
app.use("/rooms", rooms);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
