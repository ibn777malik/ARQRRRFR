import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Welcome to the Web AR Platform</h1>
      <div style={{ marginTop: "20px" }}>
        <Link href="/login" legacyBehavior>
          <a
            style={{
              marginRight: "10px",
              padding: "10px 20px",
              background: "#0070f3",
              color: "#fff",
              borderRadius: "5px",
              textDecoration: "none",
            }}
          >
            Login
          </a>
        </Link>
        <Link href="/register" legacyBehavior>
          <a
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              background: "#28a745",
              color: "#fff",
              borderRadius: "5px",
              textDecoration: "none",
            }}
          >
            Register
          </a>
        </Link>
      </div>
    </div>
  );
}
