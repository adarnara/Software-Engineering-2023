const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectionParams ={
  useNewUrlParser: true,
  useUnifiedTopology: true 
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, connectionParams);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    // If the DB connection fails, it might be a good idea to exit the process with an error code
    process.exit(1);
  }
}

module.exports = connectDB;