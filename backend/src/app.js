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

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(cors());

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