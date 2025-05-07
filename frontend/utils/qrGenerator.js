const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

async function createQR(arViewUrl, filename, qrDir) {
  try {
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    const qrFilePath = path.join(qrDir, `${filename}.png`);

    // ✅ Generate QR Code linking to AR View
    await QRCode.toFile(qrFilePath, arViewUrl);

    console.log("✅ QR Code saved:", qrFilePath);

    return { qrCodePath: qrFilePath, qrUrl: `/qrcodes/${filename}.png` };
  } catch (error) {
    console.error("❌ QR Code Generation Failed:", error);
    throw new Error("QR Code generation error");
  }
}

module.exports = { createQR };
