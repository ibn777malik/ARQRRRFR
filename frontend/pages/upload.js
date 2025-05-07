import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

export default function Upload() {
  const [file, setFile] = useState(null);
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Please log in first.");
        router.push("/login");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });

      console.log("✅ Upload success", res.data);
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Upload failed", error.response?.data || error.message);
    }
  };

  return (
    <div style={styles.container}>
      {/* Upload Card */}
      <div style={styles.card}>
        <h2 style={styles.title}>Upload New Model</h2>

        {/* Upload Form */}
        <form onSubmit={handleUpload} style={styles.form}>
          <label htmlFor="fileUpload" style={styles.uploadLabel}>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <div style={styles.uploadBox}>
              <span style={styles.uploadText}>📁 Click to Choose a File</span>
            </div>
          </label>

          <button type="submit" style={styles.uploadButton}>
            🚀 Upload Model
          </button>
        </form>

        {/* Navigation Links */}
        <div style={styles.backLinks}>
          <Link href="/dashboard" legacyBehavior>
            <a style={styles.link}>⬅ Back to Dashboard</a>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ✅ Styled Components (FIXED CENTERING)
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#f4f4f9",
  },
  card: {
    width: "400px",
    padding: "30px",
    background: "#fff",
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    color: "#333",
    fontWeight: "600",
    fontSize: "22px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  uploadLabel: {
    width: "100%",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
  },
  uploadBox: {
    width: "100%",
    height: "150px", // ✅ Keeps it centered inside the box
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    transition: "0.3s",
    textAlign: "center",
  },
  uploadBoxHover: {
    background: "#e9ecef",
    border: "2px dashed #0070f3",
  },
  uploadText: {
    color: "#0070f3",
    fontSize: "16px",
  },
  fileInput: {
    display: "none",
  },
  uploadButton: {
    marginTop: "15px",
    padding: "12px 20px",
    backgroundColor: "#0070f3",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
  },
  uploadButtonHover: {
    backgroundColor: "#0056b3",
  },
  backLinks: {
    marginTop: "15px",
  },
  link: {
    color: "#0070f3",
    textDecoration: "none",
    fontSize: "14px",
  },
};
