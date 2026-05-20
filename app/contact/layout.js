const branchSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "SDRC Diagnostics — SD Road Collection Centre",
    medicalSpecialty: "DiagnosticLab",
    telephone: "+91-40-6600-4200",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1-1-58/7/3, Srinath Complex, SD Road, Opp. Taj Mahal Hotel",
      addressLocality: "Secunderabad",
      addressRegion: "Telangana",
      postalCode: "500003",
      addressCountry: "IN"
    },
    parentOrganization: { "@type": "MedicalBusiness", name: "SDRC Diagnostics", url: "https://sdrc.in" }
  },
  {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "SDRC Diagnostics — West Marredpally Collection Centre",
    medicalSpecialty: "DiagnosticLab",
    telephone: "+91-40-6600-4200",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot No. 35 & 36, Santhoshima Colony, West Marredpally, Next to Happy Women's Clinic",
      addressLocality: "Secunderabad",
      addressRegion: "Telangana",
      postalCode: "500026",
      addressCountry: "IN"
    },
    parentOrganization: { "@type": "MedicalBusiness", name: "SDRC Diagnostics", url: "https://sdrc.in" }
  },
  {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "SDRC Diagnostics — Yapral Collection Centre",
    medicalSpecialty: "DiagnosticLab",
    telephone: "+91-40-6600-4200",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ambey Nilayam, Ground Floor, Bhanu Enclave, Yapral",
      addressLocality: "Secunderabad",
      addressRegion: "Telangana",
      postalCode: "500087",
      addressCountry: "IN"
    },
    parentOrganization: { "@type": "MedicalBusiness", name: "SDRC Diagnostics", url: "https://sdrc.in" }
  }
];

export const metadata = {
  title: "Contact & Locations",
  description: "Contact SDRC Diagnostics at Jade Arcade, Paradise, Secunderabad, Hyderabad, Telangana — 040 6600 4200. Collection centres at SD Road, West Marredpally and Yapral. Book appointments, request home collection or download reports via WhatsApp.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact SDRC Diagnostics | Secunderabad",
    description: "Main centre at Jade Arcade, Paradise, Secunderabad, Hyderabad. Collection centres across Secunderabad. Call or WhatsApp for appointments.",
    url: "https://sdrc.in/contact",
  },
};

export default function Layout({ children }) {
  return (
    <>
      {branchSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      {children}
    </>
  );
}
