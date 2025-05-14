import User from "../models/User.js";


//UPdate User Cart data: api/cart/update
export const updateCart = async (req,res) => {
  try {
    const { userId,cartItems }= req.body;
    await User.findByIdAndUpdate(userId,{cartItems});
    return res.json({success:true,message:'Cart updated!'})
  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}