const QRCode = require("qrcode");
const fs = require("fs");

async function createQR(url, filePath) {
  try {
    await QRCode.toFile(filePath, url);
    console.log("✅ QR Code saved:", filePath);
  } catch (error) {
    console.error("❌ QR Code Generation Failed:", error);
    throw new Error("QR Code generation error");
  }
}

module.exports = { createQR };
