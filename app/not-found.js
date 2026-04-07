import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 900, margin: "72px auto", padding: 24 }}>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, background: "white", padding: 40, textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 30, color: "#0f172a" }}>Page not found</h1>
        <p style={{ color: "#475569", marginTop: 12 }}>The page you requested does not exist.</p>
        <Link href="/" style={{ display: "inline-block", marginTop: 18, background: "#008f82", color: "white", padding: "10px 16px", borderRadius: 10 }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
