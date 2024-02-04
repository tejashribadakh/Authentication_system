const passport=require("passport");
const collection = require("./mongodb");
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
require('dotenv').config()
passport.use(new GoogleStrategy(
{
    clientID:"611139435656-jb5cirubm8hsbh460il6vub7e1ok8e26.apps.googleusercontent.com",
    clientSecret:"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",
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback   : true
},
  function(request, accessToken, refreshToken, profile, done) 
  {
    User.findOne({ googleId: profile.id }, (err, existingUser) => 
    {
      if (err) return done(err);

      if (existingUser) 
      {
          return done(null, existingUser);
      } else 
      {
          const newUser = new collection(
          {
              googleId: profile.id,
              displayName: profile.displayName
          });

          newUser.save((err) => {
              if (err) return done(err);
              return done(null, newUser);
          });
      }
  });

   done(null,profile);
  }
));
passport.serializeUser((user,done)=>
{
    done(null,user.id)
});
passport.deserializeUser(function(id,done)
{
   collection.findById(id,function(err,user)
   {done(null,user)})
})