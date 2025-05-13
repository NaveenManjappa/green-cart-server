import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

//Register user: /api/user/register
export const register = async (req,res) => {
try {
  const { name,email,password} = req.body;
  
  if(!name || !email || !password){
    return res.json({success:false,message:'Missing details'});
  }

  const existingUser = await User.findOne({email});
  if(existingUser)
    return res.json({success:false,message:'User already exists'});

  const hashedPassword = await bcrypt.hash(password,10);

  const user = await User.create({name,email,password:hashedPassword});

  const token = jwt.sign({id:user._id},process.env.JWT_SECRETE,{expiresIn:'7d'});

  res.cookie('token',token,{
    httpOnly:true,//prevent JS to access the cookie
    secure: process.env.NODE_ENV === 'production', //Use secure cookies in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //protects against CSRF
    maxAge: 7*24*60*60*1000, //cookie exp time in ms
  });

  return res.json({success:true,user:{email:user.email,name:user.name}});

} catch (error) {
  console.error(error);
  return res.json({success:false,message:error.message})
}
}