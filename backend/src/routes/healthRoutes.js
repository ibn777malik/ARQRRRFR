const express = require("express");
const router = express.Router();

// Simple health check route
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;