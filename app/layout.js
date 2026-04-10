import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata = {
  metadataBase: new URL("https://sdrc.in"),
  title: {
    default: "SDRC Diagnostics",
    template: "%s | SDRC Diagnostics"
  },
  description: "Advanced diagnostic centre at Jade Arcade, Secunderabad.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "https://sdrc.in",
    siteName: "SDRC Diagnostics",
    title: "SDRC Diagnostics",
    description: "Advanced diagnostic centre at Jade Arcade, Secunderabad.",
    images: [
      {
        url: "/assets/og-sdrc.jpg",
        width: 1200,
        height: 630,
        alt: "SDRC Diagnostics"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "SDRC Diagnostics",
    description: "Advanced diagnostic centre at Jade Arcade, Secunderabad.",
    images: ["/assets/og-sdrc.jpg"]
  },
  icons: {
    icon: "/assets/favicon.ico",
    apple: "/assets/apple-touch-icon.png"
  }
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    medicalSpecialty: "DiagnosticLab",
    name: "SDRC Diagnostics",
    url: "https://sdrc.in",
    image: "https://sdrc.in/assets/og-sdrc.jpg",
    telephone: "+91-40-6600-4200",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jade Arcade, Paradise",
      addressLocality: "Secunderabad",
      addressRegion: "Telangana",
      postalCode: "500003",
      addressCountry: "IN"
    }
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
