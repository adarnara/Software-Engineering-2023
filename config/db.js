const mongoose = require('mongoose');
const dotenv = require('dotenv');

console.log("4");

dotenv.config();

console.log("8");

const connectionParams ={
  useNewUrlParser: true,
  useUnifiedTopology: true 
}

console.log("15");

const connectDB = async () => {
  try {
    console.log("19");
    await mongoose.connect(process.env.MONGO_URI, connectionParams);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    // If the DB connection fails, it might be a good idea to exit the process with an error code
    process.exit(1);
  }
}
connectDB();

module.exports = connectDB;