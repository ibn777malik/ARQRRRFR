const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to protect routes
exports.protect = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided" });
    }

    // Check if token is in Bearer format
    const token = authHeader.startsWith("Bearer ") 
        ? authHeader.split(" ")[1] // Extract token from "Bearer <token>"
        : authHeader; // Use the whole header as token

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Set user info in request
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

// For optional authentication (routes that work both authenticated and unauthenticated)
exports.optional = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        // No token, continue as unauthenticated
        return next();
    }

    // Try to extract and verify token
    const token = authHeader.startsWith("Bearer ") 
        ? authHeader.split(" ")[1]
        : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Set user info if token is valid
    } catch (error) {
        // Invalid token, but we continue anyway
        console.warn("Invalid token in optional auth:", error);
    }
    
    next();
};