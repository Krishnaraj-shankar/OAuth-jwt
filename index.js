require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const jwt = require('jsonwebtoken')
require('./auth');

// '/' route is login
// after successful login it goes to '/home' route



const app = express();

//initially see for req.user and if it is not present check for req.header there we have authorization accessToken, check that 
//after first isLoggedIn send the jwt token to the user so that he sends jwt token in header for all other request -> watch youtube for jwt token in header

function isLoggedIn(req, res, next) {
  // req.user ? next() : res.redirect("/");
  // console.log("sessions",Object.keys(req.sessionStore.sessions).length);
  // const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoia3Jpc2htc2QuNDc1NDQ4NUBnbWFpbC5jb20iLCJpYXQiOjE2OTI3MjI2NjAsImV4cCI6MTY5NTI0MjY2MH0.-JdQRYeSAS10DHS03lUMdmyYRZjs0Axqw8Fwxp5J4jw';
  // console.log("req.user", req.user);
  if(req.user){
    next();
  } else if(req.headers.authorization) {
    console.log("req.header",req.headers.authorization);
    res.redirect("/home")
  } else {
    res.redirect("/")
  }
  // jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, user) => {
  //   if (err) return res.send("unauthorized by me")
  //   next();
  // })

}

app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.sendFile("/Users/krishna-17258/Personal/MadrasPalli/OAuth_jwt/OAuth-jwt/index.html");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

app.get( '/api/sessions/oauth/google',
  passport.authenticate( 'google', {
    successRedirect: '/home',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/home', isLoggedIn, (req, res) => {
    // console.log("req: ",req.user.accessTokenJWT);
    // res.send(`Hello ${req.user.displayName}`);
    if(req.user){
      console.log("req.user.accessTokenJWT" , req.user.accessTokenJWT);
      res.send({'accessTokenJWT ' : req.user.accessTokenJWT});
    } else {
      console.log("I'm home");
      res.send("I'm home");
    }
});

app.get("/fuck", isLoggedIn ,(req,res)=>{
    res.send("Hello fuck");
})

app.get("/poda", isLoggedIn , (req,res)=>{
    res.send("poda");
})

app.get('/logout', isLoggedIn, (req, result) => {
  req.logout((err,res)=>{
    if(!err) {
        console.log("logged out");
        req.session.destroy();
        // res.send('Goodbye!');
        result.send("Goodbye");
    }
    else{
        console.log("error occured: ",err);
    }
  });
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.listen(3000, () => console.log('listening on port: 3000'));