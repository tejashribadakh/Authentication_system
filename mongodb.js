const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/mydemo",{useNewUrlParser:true,useUnifiedTopology:true,serverSelectionTimeoutMS:30000}).then(()=>
console.log("mongodb connected")).catch((err)=>console.log(err));

const LoginSchema=new mongoose.Schema({
   name:{
    type:String,requried:true
   } ,
   password:{
    type:String,requried:true
   } 
})

const collection = new mongoose.model("collection1",LoginSchema);
module.exports=collection