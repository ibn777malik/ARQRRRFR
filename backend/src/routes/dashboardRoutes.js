const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Element = require("../../models/Element");  // ✅ Correct path based on your project structure


const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Middleware: Verify Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized: No token provided" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// ✅ Fetch All Uploads & Elements
router.get("/uploads", verifyToken, async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.userId }).populate("elements");
    res.json(uploads);
  } catch (error) {
    console.error("Error fetching uploads:", error);
    res.status(500).json({ error: "Failed to retrieve uploads." });
  }
});

// ✅ Fetch a Single Upload by ID (With Elements)
router.get("/uploads/:id", verifyToken, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id).populate("elements");
    if (!upload) return res.status(404).json({ error: "Upload not found." });

    res.json(upload);
  } catch (error) {
    console.error("Error fetching upload:", error);
    res.status(500).json({ error: "Failed to retrieve upload." });
  }
});

// ✅ Save an Upload (Including Elements)
router.post("/uploads", verifyToken, async (req, res) => {
  try {
    const { fileUrl, qrCodeUrl, interactiveElements, arConfig, clickActions, elements } = req.body;

    const upload = new Upload({
      fileUrl,
      qrCodeUrl,
      interactiveElements,
      arConfig,
      clickActions,
      userId: req.userId,
    });

    // ✅ Create elements and link them to the upload
    if (elements && elements.length > 0) {
      const createdElements = await Element.insertMany(
        elements.map((element) => ({
          name: element.name || "NA",
          fileUrl: element.fileUrl,
          type: element.type,
        }))
      );

      upload.elements = createdElements.map((e) => e._id);
    }

    await upload.save();
    res.json(upload);
  } catch (error) {
    console.error("Error saving upload:", error);
    res.status(500).json({ error: "Failed to save upload." });
  }
});

// ✅ Update Element Name (Without Changing Files)
router.put("/elements/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    // ✅ Convert `_id` to MongoDB `ObjectId`
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // ✅ Ensure the element exists
    const existingElement = await Element.findById(id);
    if (!existingElement) {
      console.log("Element not found:", id);
      return res.status(404).json({ error: "Element not found" });
    }

    // ✅ Update the element name
    const updatedElement = await Element.findByIdAndUpdate(
      id,
      { name },
      { new: true } // ✅ Returns updated document
    );

    res.status(200).json({ success: true, updatedElement });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ error: "Failed to update name" });
  }
});

// ✅ Fetch All Elements
router.get("/elements", verifyToken, async (req, res) => {
  try {
    const elements = await Element.find();
    res.json(elements);
  } catch (error) {
    console.error("Error fetching elements:", error);
    res.status(500).json({ error: "Failed to retrieve elements." });
  }
});

// ✅ Delete Upload (And Associated Elements)
router.delete("/uploads/:id", verifyToken, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ error: "Upload not found." });

    // ✅ Remove associated elements first
    await Element.deleteMany({ _id: { $in: upload.elements } });

    // ✅ Delete the upload
    await upload.deleteOne();

    res.json({ message: "Upload deleted successfully." });
  } catch (error) {
    console.error("Error deleting upload:", error);
    res.status(500).json({ error: "Failed to delete upload." });
  }
});

module.exports = router;
