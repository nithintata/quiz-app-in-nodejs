const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

const User = require("./models/Users");

const {comparePassword} = require("./Utils/utils");

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({username : username},
               "username isAdmin passwordHash passwordSalt",
               async function(err, user) {
                 if (err) {
                   return done(err);
                 }

                 if (!user) {
                   return done(null, false, {message : "Incorrect Username."});
                 }
                 const verifyPassword = await comparePassword(
                     user.passwordHash, user.passwordSalt, password);
                 if (!verifyPassword) {
                   return done(null, false, {message : "Incorrect password."});
                 }

                 return done(null, user);
               });
}));

passport.serializeUser(function(user, done) { done(null, user.id); });

passport.deserializeUser(function(
    id, done) { User.findById(id, function(err, user) { done(err, user); }); });

exports.generateToken = function(user) {
  return jwt.sign(user, process.env.TokenSecret, {expiresIn : 36000});
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.TokenSecret;

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  User.findOne({_id : jwt_payload._id}, "username isAdmin", (err, user) => {
    if (err) {
      return done(err, false);
    } else if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));

exports.verifyUser = passport.authenticate("jwt", {session : false});
exports.verifyAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    err = new Error("You are not Authorized to perform this operation");
    err.status = 403;
    return next(err);
  }
};
