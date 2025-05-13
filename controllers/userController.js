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
  return res.json({success:false,message:error.message});
}
}

//Login user: /api/user/login
export const login = async (req,res) => {
  try {
    console.log('Login api called');
    const {email,password} = req.body;
    if(!email || !password)
      return res.jsoon({success:false,message:'Email and password are required!'});

    const user = await User.findOne({email});

    if(!user){
      return res.json({success:false,message:'Invalid email or password!'})
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.json({success:false,message:'Invalid email or password!'});
    }

    const token =jwt.sign({id:user._id},process.env.JWT_SECRETE,{expiresIn:'7d'});

    res.cookie('token',token,{
      httpOnly:true,//prevent JS to access the cookie
      secure: process.env.NODE_ENV === 'production', //Use secure cookies in prod
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //protects against CSRF
      maxAge: 7*24*60*60*1000, //cookie exp time in ms
    });

    return res.json({success:true,user:{email:user.email,name:user.name}});

  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}

// Check Auth: /api/user/is-auth
export const isAuth = async(req,res) => {
  try {
    console.log(req.body);
    const {userId} = req.body;
    const user = await User.findById(userId).select("-password");
    return res.json({success:true,user});
  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}

//Logout user: /api/user/logout

export const logout = async (req,res) => {
  try {
    res.clearCookie('token',{
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:process.env.NODE_ENV === 'production' ? 'none':'strict'
    });
    return res.json({success:true,message:'Logged out'});
  } catch (error) {
     console.error(error);
     return res.json({success:false,message:error.message});
  }
}