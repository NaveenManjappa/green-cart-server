import mongoose from 'mongoose';

const connectDB = async () => {
  try{
    mongoose.connection.on('connected',() => console.log('Database connected'));
    await mongoose.connect(`${process.env.MONGODB_URI}/Greencart`)
  }
  catch(error){
    console.error(error.message);
  }
}

export default connectDB;