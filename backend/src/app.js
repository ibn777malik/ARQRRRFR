// backend/src/app.js - Check MongoDB Connection

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const menuRoutes = require("./routes/menuRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

// Use DATABASE_URL from your .env file for the connection string
const MONGO_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/arqr";

// Enhanced MongoDB connection with more logging
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    
    // Test if we can query the database
    mongoose.connection.db.admin().ping((err, result) => {
      if (err) {
        console.error("❌ MongoDB ping failed:", err);
      } else {
        console.log("✅ MongoDB ping successful:", result);
      }
    });
    
    // Check if Menu collection exists
    mongoose.connection.db.listCollections({ name: 'menus' })
      .next((err, collinfo) => {
        if (err) {
          console.error("❌ Error checking Menu collection:", err);
        } else if (collinfo) {
          console.log("✅ Menu collection exists");
        } else {
          console.warn("⚠️ Menu collection does not exist!");
        }
      });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api", dashboardRoutes); // ✅ For /api/elements/:id
app.use("/api/menus", menuRoutes); // ✅ Register menu routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/health", healthRoutes); // ✅ Health check endpoint

// Serve static files
app.use("/public", express.static("src/public"));

// Handle unknown routes
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Not Found" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});