const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "SDRC Diagnostics — Physiotherapy (Recure)",
  url: "https://sdrc.in/physiotherapy",
  description: "Professional physiotherapy and rehabilitation services at SDRC Diagnostics in partnership with Recure. Orthopaedic, neurological, sports injury, post-surgical, geriatric and women's health rehab in Secunderabad and Hyderabad.",
  medicalSpecialty: "PhysicalTherapy",
  telephone: "+91-99634-32132",
  address: {
    "@type": "PostalAddress",
    streetAddress: "101, Jade Arcade (Corporate Block), Paradise, MG Road",
    addressLocality: "Secunderabad",
    addressRegion: "Telangana",
    postalCode: "500003",
    addressCountry: "IN"
  },
  areaServed: [
    { "@type": "City", name: "Secunderabad" },
    { "@type": "City", name: "Hyderabad" },
    { "@type": "State", name: "Telangana" }
  ],
  parentOrganization: { "@type": "MedicalBusiness", name: "SDRC Diagnostics", url: "https://sdrc.in" }
};

export const metadata = {
  title: "Physiotherapy in Secunderabad | Recure at SDRC",
  description: "Professional physiotherapy and rehabilitation in Secunderabad and Hyderabad at SDRC Diagnostics, in collaboration with Recure. Orthopaedic, neurological, sports injury, post-surgical, geriatric and women's health rehab at Jade Arcade, Paradise, Telangana.",
  alternates: { canonical: "/physiotherapy" },
  openGraph: {
    title: "Physiotherapy in Secunderabad | SDRC × Recure",
    description: "Evidence-based physiotherapy at SDRC Diagnostics, Secunderabad and Hyderabad — in collaboration with Recure. Orthopaedic, neuro, sports, post-surgical and geriatric rehab.",
    url: "https://sdrc.in/physiotherapy",
  },
};

export default function Layout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {children}
    </>
  );
}
