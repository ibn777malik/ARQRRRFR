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
          Authorization: token, // ✅ Ensure the token is sent
        },
      });

      console.log("✅ Upload success", res.data);
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Upload failed", error.response?.data || error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial, sans-serif" }}>
      <h2>Upload New Model</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button
          type="submit"
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload
        </button>
      </form>
      <div style={{ marginTop: "20px" }}>
        <Link href="/dashboard" legacyBehavior>
          <a style={{ color: "#0070f3" }}>Back to Dashboard</a>
        </Link>
      </div>
    </div>
  );
}
