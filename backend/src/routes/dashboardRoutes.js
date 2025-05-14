const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Element = require("../../models/Element");  // ✅ Correct path based on your project structure
const { createQR } = require("../utils/qrGenerator");
const path = require("path");
const fs = require("fs");


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
// Generate QR code for a menu
router.get("/menu-qr/:id", verifyToken, async (req, res) => {
  try {
    const menuId = req.params.id;
    
    // Assuming Element can represent a menu for now
    // Later you'll replace this with Menu model lookup
    const menuElement = await Element.findById(menuId);
    
    if (!menuElement) return res.status(404).json({ error: "Menu not found" });
    
    // Create a URL for the menu view
    const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${menuId}`;
    const qrFilename = `menu_${menuId}`;
    
    // Define QR code paths
    const qrDir = path.join(__dirname, "../public/qrcodes");
    const frontendQrDir = path.resolve(__dirname, "../../../frontend/public/qrcodes");
    
    // Make sure directories exist
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
    if (!fs.existsSync(frontendQrDir)) fs.mkdirSync(frontendQrDir, { recursive: true });
    
    // Generate QR code
    const qrFilePath = path.join(frontendQrDir, `${qrFilename}.png`);
    await createQR(menuUrl, qrFilePath);
    
    // Also create a copy in the backend public directory if different
    const backendQrPath = path.join(qrDir, `${qrFilename}.png`);
    if (qrFilePath !== backendQrPath) {
      fs.copyFileSync(qrFilePath, backendQrPath);
    }
    
    // Get frontend URL for the QR code
    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/qrcodes/${qrFilename}.png`;
    
    res.json({
      menuUrl,
      qrCodeUrl: frontendUrl
    });
  } catch (error) {
    console.error("Error generating menu QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Fetch a Single Element by ID
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
