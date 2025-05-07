const mongoose = require("mongoose");

const ElementSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "NA", // ✅ Default to "NA" if no name is provided
  },
  fileUrl: {
    type: String,
    required: true, // ✅ Stores the URL of the uploaded model or image
  },
  type: {
    type: String,
    enum: ["glb", "image", "zip"], // ✅ Restrict types to ensure consistency
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // ✅ Timestamp for when the element was added
  },
});

module.exports = mongoose.model("Element", ElementSchema);
