const express=require("express");
const path=require("path");
const mongoose=require("mongoose");
const bodyParser=require("body-parser")
const ejs=require("ejs");
const collection=require("./mongodb");
const passport=require("passport");
const session=require('express-session');
const jwt=require("jsonwebtoken");
const app=express();
require('./auth');
app.use(express.json());

function isloggedIn(req,res,next)
{
    req.user ? next():res.sendStatus(401);
}
app.get('/',(req,res)=>
{
    res.sendFile(path.resolve(__dirname,'index.html'));
});
app.use(session({
    secret: 'myscret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
  app.use(passport.initialize());
  app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
}));

app.get('/auth/google/failure',(req,res)=>
{
    res.send("something went wrong");
});

app.get('/auth/protected',isloggedIn,(req,res)=>
{
    let name=req.user.displayName;
    res.send('hello ${name}');
});

app.use('/auth/logout',(req,res)=>
{
    req.session.destroy();
    res.send("see you again");
})

app.get('/auth/google', passport.authenticate('google', { scope: ['email','profile'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => 
{
    const token = jwt.sign({ user: req.user }, secret, { expiresIn: '60s' });
    res.json({ token });
});
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: 'Access granted!', user: req.user });
});

app.set("view engine","ejs");
app.use(express.urlencoded({extended:false}))

app.get("/",(req,res)=>
{
    res.render("login")
})
app.get("/signup",(req,res)=>
{
    res.render("signup")
})

app.post("/signup",async (req,res)=>
{
    const data={
        name:req.body.name,
        password:req.body.password
    }
await collection.insertMany([data])
res.render("login");
})
app.post("/Login",async (req,res)=>
{
  try{
    const check=await collection.findOne({name:req.body.name})
    console.log(check);
    if(check.password===req.body.password)
    {
        res.render("home")
    }
    else{
        res.send("wrong password");
    }
}
catch{
    res.send("wrong details");
}
})
app.post("/update",async (req,res)=>
{
  try{
    const check=await collection.updateOne({name:req.body.username})
    console.log(check);
}
catch{
    res.send("wrong details");
}
})

app.post("/create",async(req,res)=>
{
    console.log(req.body);
    const data=new collection(req.body)
    await data.save();
    res.send({success:true,message:"data save succ..",data:data})
})


app.put("/update",async(req,res)=>
{
    console.log(req.body)
    const {id,...rest}=req.body
    console.log(rest)
    const data=await collection.updateOne({_id:id},rest)
    res.send({success:true,message:"data update",data:data})
})


app.delete("/delete/:id",async(req,res)=>
{
    const id=req.params.id
    console.log(id)
    //const {id,...rest}=req.body
   // console.log(rest)
    const data=await collection.deleteOne({_id:id})
    res.send({success:true,message:"data deleted",data:data})
})


app.get("/logout",(req,res)=>
{
    res.render("logout")
})

app.listen(5000,()=>
{
    console.log('listing port on 5000');
})
