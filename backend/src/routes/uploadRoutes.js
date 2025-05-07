require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const { createQR } = require("../utils/qrGenerator");
const jwt = require("jsonwebtoken");
const Element = require("../../models/Element");




const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ✅ Ensure Frontend & Backend Folders Exist
const zipDir = path.join(__dirname, "../public/zip");
const qrDir = path.join(__dirname, "../public/qrcodes");
const frontendUploads = path.resolve(
  __dirname,
  "../../../frontend/public/uploads"
);
const frontendQrDir = path.resolve(
  __dirname,
  "../../../frontend/public/qrcodes"
);

[zipDir, qrDir, frontendUploads, frontendQrDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ✅ Multer Storage for ZIP & GLB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, zipDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// ✅ Middleware: Verify Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Unauthorized: No token provided" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// ✅ Handle ZIP or Raw GLB Upload
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const uploadedFilePath = path.join(zipDir, req.file.filename);
    console.log("✅ File uploaded successfully:", uploadedFilePath);

    const ext = path.extname(req.file.originalname).toLowerCase();
    const qrFilename = `${Date.now()}`; // Unique identifier for the file

    // ✅ Handle direct GLB upload
    if (ext === ".glb") {
      const glbFileName = `${qrFilename}.glb`;
      const glbFilePath = path.join(frontendUploads, glbFileName);
      fs.renameSync(uploadedFilePath, glbFilePath);
      console.log("✅ GLB saved:", glbFilePath);

      // (Optional) Generate AR view URL and QR code
      const arViewUrl = `${FRONTEND_URL}/view/${glbFileName}`;
      const qrFilePath = path.join(frontendQrDir, `${qrFilename}.png`);
      const qrUrl = `${FRONTEND_URL}/qrcodes/${qrFilename}.png`;

      try {
        await createQR(arViewUrl, qrFilePath);
        console.log("✅ QR Code saved:", qrFilePath);
      } catch (qrError) {
        console.error("❌ QR Code Generation Failed:", qrError);
        return res.status(500).json({ error: "QR Code generation failed" });
      }

      // Create new element with name equal to the generated file name
      const elementName = glbFileName && glbFileName.trim().length > 0 ? glbFileName : "NA";
      const newElement = new Element({
        name: glbFileName, // name field is set to the generated file name
        fileUrl: `${FRONTEND_URL}/uploads/${glbFileName}`,
        type: "glb",
        
      });
      await newElement.save();
      console.log("Saving element with name:", glbFileName);

      return res.json({
        message: "GLB Upload Successful",
        fileUrl: `${FRONTEND_URL}/uploads/${glbFileName}`,
        arViewUrl,
        qrCodeUrl: qrUrl,
      });
    }

    // ✅ Handle ZIP upload (extract GLB from ZIP)
    if (ext === ".zip") {
      let extractedGlbFile = null;

      fs.createReadStream(uploadedFilePath)
        .pipe(unzipper.Parse())
        .on("entry", (entry) => {
          const fileName = entry.path;
          const fileExt = path.extname(fileName).toLowerCase();
          const extractedFilePath = path.join(frontendUploads, fileName);

          // Ensure subdirectories exist before writing files
          const dirPath = path.dirname(extractedFilePath);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          // ✅ For GLB files, rename to match our generated name
          if (fileExt === ".glb") {
            extractedGlbFile = `${qrFilename}.glb`;
            const glbFilePath = path.join(frontendUploads, extractedGlbFile);
            entry.pipe(fs.createWriteStream(glbFilePath));
            console.log("✅ GLB extracted:", glbFilePath);
          }
          // ✅ Save image files with original names
          else if ([".jpg", ".jpeg", ".png", ".webp"].includes(fileExt)) {
            entry.pipe(fs.createWriteStream(extractedFilePath));
            console.log("✅ Image extracted:", extractedFilePath);
          } else {
            entry.autodrain();
          }
        })
        .on("close", async () => {
          if (!extractedGlbFile) {
            return res
              .status(400)
              .json({ error: "No GLB file found in the ZIP archive" });
          }

          const arViewUrl = `${FRONTEND_URL}/view/${extractedGlbFile}`;
          const qrFilePath = path.join(frontendQrDir, `${qrFilename}.png`);
          const qrUrl = `${FRONTEND_URL}/qrcodes/${qrFilename}.png`;

          try {
            await createQR(arViewUrl, qrFilePath);
            console.log("✅ QR Code saved:", qrFilePath);
          } catch (qrError) {
            console.error("❌ QR Code Generation Failed:", qrError);
            return res.status(500).json({ error: "QR Code generation failed" });
          }

          // Create new element with name equal to the generated file name
          const newElement = new Element({
            name: extractedGlbFile, // name field set to the generated file name
            fileUrl: `${FRONTEND_URL}/uploads/${extractedGlbFile}`,
            type: "glb", // we assume it's a GLB file extracted from the ZIP
          });
          await newElement.save();

          res.json({
            message: "ZIP Upload Successful",
            fileUrl: `${FRONTEND_URL}/uploads/${extractedGlbFile}`,
            arViewUrl,
            qrCodeUrl: qrUrl,
          });
        });
    } else {
      return res.status(400).json({
        error: "Unsupported file format. Please upload a .zip or .glb file.",
      });
    }
  } catch (error) {
    console.error("❌ Upload Processing Error:", error);
    res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

// ✅ Serve QR Codes & Uploaded Files
router.use("/qrcodes", express.static(frontendQrDir));
router.use("/uploads", express.static(frontendUploads));

// Add this GET endpoint to your uploadRoutes.js
router.get("/", async (req, res) => {
  try {
    // Fetch all Elements from the database.
    // Only select the fields we care about: name, fileUrl, qrCodeUrl, type, createdAt.
    const uploads = await Element.find({}).select("name fileUrl qrCodeUrl type createdAt");
    
    // If your dashboard expects a field called "url" (for AR view link) instead of "fileUrl",
    // map the fileUrl to url in the returned objects.
    const mappedUploads = uploads.map(upload => ({
      _id: upload._id,
      name: upload.name && upload.name.trim().length > 0 ? upload.name : "NA",
      url: upload.fileUrl,      // using fileUrl as the file's URL
      qrCodeUrl: upload.qrCodeUrl,
      type: upload.type,
      createdAt: upload.createdAt,
    }));
    
    res.json(mappedUploads);
  } catch (error) {
    console.error("Error fetching uploads:", error);
    res.status(500).json({ error: "Error fetching uploads" });
  }
});
module.exports = router;
