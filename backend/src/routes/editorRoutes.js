const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createQR } = require("../utils/qrGenerator");
const Element = require("../models/Element"); // ✅ Import MongoDB model
const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, "../public/uploads");

// ✅ Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

// --------------------------------
// ✅ Upload File (GLB, ZIP, or Image)
// --------------------------------
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileUrl = `/uploads/${req.file.filename}`;
    const { name, type } = req.body;

    // ✅ Save file info in MongoDB
    const newElement = new Element({
      name: name || "NA",
      fileUrl,
      type,
    });

    await newElement.save();

    res.json({
      message: "Upload successful",
      fileUrl,
      name: newElement.name,
      elementId: newElement._id, // ✅ Send element ID
    });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// --------------------------------
// ✅ Get All Elements
// --------------------------------
router.get("/elements", async (req, res) => {
  try {
    const elements = await Element.find();
    res.json(elements);
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch elements" });
  }
});

// --------------------------------
// ✅ Update Element Name
// --------------------------------
router.put("/element/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const updatedElement = await Element.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!updatedElement) return res.status(404).json({ error: "Element not found" });

    res.json({ message: "Name updated", updatedElement });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ error: "Failed to update element name" });
  }
});

// --------------------------------
// ✅ Delete Element
// --------------------------------
router.delete("/element/:id", async (req, res) => {
  try {
    const deletedElement = await Element.findByIdAndDelete(req.params.id);
    if (!deletedElement) return res.status(404).json({ error: "Element not found" });

    // ✅ Remove file from the server
    const filePath = path.join(UPLOADS_DIR, path.basename(deletedElement.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Element deleted", deletedElement });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({ error: "Failed to delete element" });
  }
});
// --------------------------------
// ✅ Rename Element (NEW Route for Renaming)
// --------------------------------
router.patch("/api/update-element-name", async (req, res) => {
    try {
      const { elementId, name } = req.body;
      if (!elementId || !name) return res.status(400).json({ error: "Invalid request" });
  
      const updatedElement = await Element.findByIdAndUpdate(
        elementId,
        { name },
        { new: true }
      );
  
      if (!updatedElement) return res.status(404).json({ error: "Element not found" });
  
      res.json({ message: "Element renamed", updatedElement });
    } catch (error) {
      console.error("❌ Rename Error:", error);
      res.status(500).json({ error: "Failed to rename element" });
    }
  });
  // GET /api/elements/:id
router.get("/elements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching element with ID: ${id}`);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid ObjectId: ${id}`);
      return res.status(400).json({ error: "Invalid model ID format" });
    }

    // Query the Element collection
    const element = await Element.findById(id);
    if (!element) {
      console.log(`Element not found for ID: ${id}`);
      return res.status(404).json({ error: "Model not found" });
    }

    console.log(`Found element: ${element.name}`);
    res.status(200).json({
      _id: element._id,
      name: element.name,
      fileUrl: element.fileUrl,
      type: element.type,
      createdAt: element.createdAt,
    });
  } catch (error) {
    console.error(`Error fetching element ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch model", message: error.message });
  }
});
  
module.exports = router;
