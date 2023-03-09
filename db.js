const mongoose = require('mongoose');
const db = process.env.MONGODB_URI;

const connectDB = () => {
  try {
    // Connect to mongoDB
    mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    // Exit process with failure
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
