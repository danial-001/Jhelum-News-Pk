const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  newsHeading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  newsCreationTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ["JHELUM", "NATIONAL", "INTERNATIONAL"], // Define valid categories
    required: true,
  },
});

module.exports = mongoose.model("News", newsSchema);
