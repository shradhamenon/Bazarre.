var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
var User = require('./models/user-model');
var cookieSession = require('cookie-session');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(new GoogleStrategy({
    callbackURL: 'http://localhost:5000/auth/google/redirect',
    clientID: '904558563417-8518cksoulutcoftco17pojf86kgiro6.apps.googleusercontent.com',
    clientSecret: '66q6Ja2s3guzSokzN_si_fdY'
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ googleID: profile.id }).then((currentUser) => {
        if (currentUser) {
            console.log(currentUser);
            done(null, currentUser);
        } else {
            new User({
                googleID: profile.id,
                fullname: profile.displayName,
                bookmarks: []
            }).save().then((newUser) => {
                console.log(newUser);
                done(null, newUser);
            });
        }
    })
})
);