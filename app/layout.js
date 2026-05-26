import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import RouteAnalytics from "@/components/site/RouteAnalytics";

export const metadata = {
  metadataBase: new URL("https://sdrc.in"),
  title: {
    default: "SDRC Diagnostics",
    template: "%s | SDRC Diagnostics"
  },
  description: "Advanced diagnostic centre at Jade Arcade, Secunderabad, Hyderabad, Telangana.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "https://sdrc.in",
    siteName: "SDRC Diagnostics",
    title: "SDRC Diagnostics",
    description: "Advanced diagnostic centre at Jade Arcade, Secunderabad, Hyderabad, Telangana.",
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
    description: "Advanced diagnostic centre at Jade Arcade, Secunderabad, Hyderabad, Telangana.",
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
    alternateName: "Secunderabad Diagnostic and Research Centre",
    description: "NABL accredited multi-specialty diagnostic centre in Secunderabad, Hyderabad offering CT, X-ray, mammography, DEXA, ultrasound, ECG, pathology and master health check packages since 1983.",
    url: "https://sdrc.in",
    image: "https://sdrc.in/assets/og-sdrc.jpg",
    telephone: "+91-40-6600-4200",
    email: "info@sdrc.in",
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: "101, Jade Arcade (Corporate Block), Paradise, MG Road",
      addressLocality: "Secunderabad",
      addressRegion: "Telangana",
      postalCode: "500003",
      addressCountry: "IN"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 17.4413,
      longitude: 78.4692
    },
    hasMap: "https://maps.app.goo.gl/568UAthpfTsJd7Gn7",
    areaServed: [
      { "@type": "City", name: "Secunderabad" },
      { "@type": "City", name: "Hyderabad" },
      { "@type": "State", name: "Telangana" }
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "07:00",
        closes: "21:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "07:00",
        closes: "14:00"
      }
    ],
    sameAs: [
      "https://facebook.com/sdrc.in",
      "https://instagram.com/sdrc.in",
      "https://maps.app.goo.gl/568UAthpfTsJd7Gn7",
      "https://linktr.ee/sdrcin"
    ],
    foundingDate: "1983",
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "NABL Accreditation",
      name: "NABL Medical Laboratory Accreditation (ISO 15189:2022)",
      recognizedBy: { "@type": "Organization", name: "National Accreditation Board for Testing and Calibration Laboratories" }
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SDRC Diagnostics",
    url: "https://sdrc.in",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://sdrc.in/tests?q={search_term_string}" },
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://sdrc.in" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://sdrc.in/services" },
      { "@type": "ListItem", position: 3, name: "Health Packages", item: "https://sdrc.in/packages" },
      { "@type": "ListItem", position: 4, name: "Book a Test", item: "https://sdrc.in/tests" },
      { "@type": "ListItem", position: 5, name: "DEXA Body Composition Scan", item: "https://sdrc.in/dexa-body-composition" },
      { "@type": "ListItem", position: 6, name: "Contact", item: "https://sdrc.in/contact" },
    ]
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <Providers>
          <RouteAnalytics />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
