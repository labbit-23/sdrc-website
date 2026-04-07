export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://sdrc.in/sitemap.xml"
  };
}
