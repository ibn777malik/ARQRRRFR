const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getUploads = async (req, res) => {
  try {
    const uploads = await prisma.upload.findMany();
    res.json(uploads.length ? uploads : []); // Always return an array
  } catch (error) {
    console.error("Error fetching uploads:", error);
    res.status(500).json({ error: "Error fetching uploads" });
  }
};
