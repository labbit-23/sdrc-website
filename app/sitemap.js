const routes = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/packages", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tests", priority: 0.9, changeFrequency: "daily" },
  { path: "/home-visit", priority: 0.85, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/accreditation", priority: 0.7, changeFrequency: "monthly" },
  { path: "/physiotherapy", priority: 0.7, changeFrequency: "weekly" },
  { path: "/privacy-policy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/tnc", priority: 0.4, changeFrequency: "yearly" }
];

export default function sitemap() {
  const now = new Date();
  return routes.map((route) => ({
    url: `https://sdrc.in${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
