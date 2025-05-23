import { v2 as cloudinary} from "cloudinary";
import Product from "../models/Product.js";
import { request } from "express";

// Add product: api/product/add
export const addProduct = async (req,res) => {
  try {
    let productData =JSON.parse(req.body.productData);
    const images = req.files;
    let imagesUrl = await Promise.all(
      images.map(async (image)=> {
        let result = await cloudinary.uploader.upload(image.path,{resource_type:'image'});
        return result.secure_url;
      })
    )
    await Product.create({...productData,image:imagesUrl});

    return res.json({success:true,message:'Product added'});
  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}


//Get product: api/product/list
export const productList = async (req,res) => {
try {
  const products = await Product.find({});
  return res.json({success:true,products})
} catch (error) {
   console.error(error);
   return res.json({success:false,message:error.message});
}
}

//Get single product: api/product/id
export const productById = async (req,res) => {
try {
  const { id } = req.body;
  const product = await Product.findById(id);
  return res.json({success:true,product});
} catch (error) {
  console.error(error);
    return res.json({success:false,message:error.message});
}
}

//Change product inStock: api/product/stock
export const changeStock = async(req,res) => {
  try {
    console.log(req.body);
    const {id,inStock} = req.body;
    await Product.findByIdAndUpdate(id,{inStock});
    return res.json({success:true,message:'Stock updated'});
  } catch (error) {
    console.error(error);
    return res.json({success:false,message:error.message});
  }
}