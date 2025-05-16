import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";

//Place Order COD: /api/order/cod
export const placeOrderCOD = async(req,res) => {
  try {
    const { userId,items,address} = req.body;
    if(!address || items.length === 0){
      return res.json({success:false,message:'Invalid data'});      
    }

    //calculate the amount
    let amount = await items.reduce(async(acc,item)=> {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    },0);

    //Add tax
    amount += Math.floor(amount*0.02);
    await Order.create({userId,items,amount,address,paymentType:'COD'});

     return res.json({success:true,message:'Order placed successfully'});     

  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}

//Place Order Stripe: /api/order/stripe
export const placeOrderStripe = async(req,res) => {
  try {
    const { userId,items,address} = req.body;
    const { origin } = req.headers;

    if(!address || items.length === 0){
      return res.json({success:false,message:'Invalid data'});      
    }

    let productData = [];

    //calculate the amount
    let amount = await items.reduce(async(acc,item)=> {
      const product = await Product.findById(item.product);
      productData.push({ name:product.name,price:product.offerPrice,quantity:item.quantity });
      return (await acc) + product.offerPrice * item.quantity;
    },0);

    //Add tax
    amount += Math.floor(amount*0.02);
    const order = await Order.create({userId,items,amount,address,paymentType:'Online'});

    //Stripe gateway
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    //create line items for stripe
    const line_items = productData.map((item)=>{
      return {
        price_data:{
          currency:'GBP',
          product_data:{
            name:item.name
          },
          unit_amount: Math.floor(item.price + item.price * .02)*100
        },
        quantity:item.quantity
      } 
    });

    //create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode:"payment",
      success_url:`${origin}/loader?next=my-orders`,
      cancel_url:`${origin}/cart`,
      metadata:{
        orderId:order._id.toString(),
        userId
      }
    });

    return res.json({success:true,url:session.url });     

  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}

//Get Orders by User Id: /api/order/user
export const getUserOrders = async (req,res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({userId,$or:[{paymentType:'COD'},{isPaid:true}]}).populate("items.product address").sort({createdAt: -1});

    return res.json({success:true,orders});     


  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}

//Get All Orders for seller or admin: /api/order/seller
export const getAllOrders = async(req,res) => {
  try {
    const orders = await Order.find({
      $or:[{paymentType:'COD'},{isPaid:true}]
    }).populate("items.product address").sort({createdAt: -1});

    return res.json({success:true,orders});

  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}