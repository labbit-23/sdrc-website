const routes = ["", "/services", "/packages", "/about", "/contact", "/accreditation", "/privacy-policy", "/physiotherapy"];

export default function sitemap() {
  const now = new Date();
  return routes.map((route) => ({
    url: "https://sdrc.in" + route,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8
  }));
}
