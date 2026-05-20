export const metadata = {
  title: "DEXA Body Composition Scan",
  description: "DEXA scan (DXA) in Hyderabad and Secunderabad, Telangana. Measure body fat %, lean muscle mass and bone mineral density simultaneously in one 15-minute scan. GE Lunar DPX-NT at SDRC Diagnostics, Jade Arcade. Essential for GLP-1 / semaglutide users and osteoporosis screening.",
  alternates: { canonical: "/dexa-body-composition" },
  openGraph: {
    title: "DEXA Body Composition Scan | SDRC Diagnostics",
    description: "Precision body fat %, lean mass and bone density — all in one scan. Available at SDRC Diagnostics, Secunderabad, Hyderabad.",
    url: "https://sdrc.in/dexa-body-composition",
    images: [{ url: "/assets/dexa/fat-heatmap.webp", width: 951, height: 2977, alt: "DEXA fat distribution scan" }],
  },
};

export default function Layout({ children }) {
  return children;
}
