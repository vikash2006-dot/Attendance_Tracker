const mongoose = require('mongoose');

// Connect to MongoDB using the connection string from environment variables
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('⚠️  WARNING: MONGO_URI is not defined in environment variables.');
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do not crash immediately so dev server can still inspect errors or load
  }
};

module.exports = connectDB;
