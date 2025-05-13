import jwt from "jsonwebtoken";

const authUser = async (req,res,next) => {
  console.log('Auth user middleware called');
  const {token} = req.cookies;

  if(!token){
    return res.json({success:false,message:'Not Authorized'});
  }

  try {
    const tokenDecode = jwt.verify(token,process.env.JWT_SECRETE);
    console.log(tokenDecode);
    req.body = req.body || {};
    if(tokenDecode.id){
      req.body.userId = tokenDecode.id;
      console.log(req.body.userId);
    }else {
      return res.json({success:false,message:'Not Authorized'});
    }
    console.log(req.body);
    next();
  } catch (error) {
    return res.json({success:false,message:error.message})
  }

}

export default authUser;