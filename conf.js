const mongoose = require("mongoose");
const connect = mongoose.connect(
  "mongodb://localhost:27017/Jhelum_News/login_credentials"
);

// Check database connected or not
connect
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch(() => {
    console.log("Database cannot be Connected");
  });

// Create Schema
const Loginschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: false,
  },
});

// collection part
const collection = new mongoose.model("users", Loginschema);

module.exports = collection;
