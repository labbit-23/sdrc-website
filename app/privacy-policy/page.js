"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";

const policySections = [
  {
    title: "1. Purpose and Commitment",
    paragraphs: [
      "SDRC Diagnostics LLP (\"SDRC\", \"we\", \"us\", or \"our\") is committed to safeguarding the privacy, confidentiality, and security of personal and health information collected from our clients (\"you\" or \"patients\"). This policy outlines how we collect, use, disclose, store, and protect your personal and sensitive health data in compliance with the Digital Personal Data Protection Act, 2023, and the Information Technology Act, 2000, including the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011."
    ]
  },
  {
    title: "2. Scope",
    paragraphs: ["This policy applies to:"],
    bullets: [
      "All patient data collected through registration, diagnostic testing, sample processing, and reporting (both online and offline).",
      "Data collected via our website, mobile applications, or electronic health record systems.",
      "All employees, contractors, and partner organizations who have authorized access to patient data."
    ]
  },
  {
    title: "3. Categories of Information Collected",
    paragraphs: ["We may collect and process the following categories of data as part of delivering our diagnostic services:"],
    bullets: [
      "Personal Information: Name, age, contact details, address, gender, identification numbers.",
      "Health and Medical Data: Medical history, diagnostic test results, prescriptions, sample data, clinical notes, and treatment-related information shared with us.",
      "Demographic Information: Age, sex, location, occupation, and other relevant demographics.",
      "Financial Data: Billing details, payment information, and insurance-related data where applicable.",
      "Technical and Usage Data: IP address, browser information, device identifiers, session identifiers and usage logs when you use our website, client portal, or online report access."
    ],
    closing:
      "All such data relating to health, financials and medical records is treated as Sensitive Personal Data or Information (SPDI) in line with Rule 3 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011."
  },
  {
    title: "4. Basis for Collection and Use",
    paragraphs: ["We collect and process data on the following lawful bases:"],
    bullets: [
      "Consent: Explicit or implied consent when you present for diagnostic services, register with us, or submit information online.",
      "Contractual Necessity: To perform diagnostic tests, issue reports, and provide services that you or your doctor request from us.",
      "Legal Obligation: To comply with applicable laws, including but not limited to PNDT regulations, infectious disease reporting requirements, and other statutory directions.",
      "Public Health Interest: For anonymised or aggregated reporting as required by public health authorities and regulators."
    ]
  },
  {
    title: "5. Purpose of Data Usage",
    paragraphs: ["Your personal and health data may be used by SDRC for the following purposes:"],
    bullets: [
      "Registering patients, creating records, and managing appointments or scheduling.",
      "Conducting diagnostic tests, processing samples, and issuing reports.",
      "Communicating reports, follow-up alerts, preparation instructions, and health-related notifications.",
      "Processing billing, payments, and insurance claims where applicable.",
      "Meeting regulatory, accreditation, and statutory reporting obligations under Indian law.",
      "Conducting internal quality control, audits, training, analytics, and research activities, strictly using de-identified or anonymised data wherever feasible."
    ]
  },
  {
    title: "6. Data Storage and Security Practices",
    paragraphs: [
      "To ensure data integrity and confidentiality, SDRC follows reasonable security practices as defined under Rule 8 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. Measures include, but are not limited to:"
    ],
    bullets: [
      "Secure electronic databases with restricted, role-based access controls.",
      "Encryption and secure configurations for sensitive personal data at rest and during transmission, where applicable.",
      "Regular security audits, monitoring of access logs, and review of authorisations.",
      "Mandatory confidentiality and non-disclosure agreements for all employees and authorised personnel.",
      "Physical safeguards for paper-based records, including restricted storage and controlled access."
    ]
  },
  {
    title: "7. Data Sharing and Disclosure",
    paragraphs: [
      "SDRC does not sell or rent your personal or health data. We may disclose information only in the following situations:"
    ],
    bullets: [
      "Referral Doctors / Treating Physicians: To support continuity of care, interpretation of reports, and clinical decision-making.",
      "Referring Organisations: Such as employers, insurers, wellness programs or government schemes, strictly under pre-agreed terms and valid consent or lawful basis.",
      "Regulatory or Government Agencies: Where mandated by applicable law, court orders or directions of competent authorities.",
      "Researchers or Analysts: Only de-identified, anonymised or aggregated data may be shared for audits, quality improvement or research, without directly identifying individual patients."
    ],
    closing:
      "Disclosure may occur without prior permission where legally required for identity verification, public health protection, prevention or investigation of offences, or pursuant to orders from courts and law enforcement agencies."
  },
  {
    title: "8. Patient Consent and Rights",
    paragraphs: [
      "Under the Digital Personal Data Protection Act, 2023 and applicable IT Rules, patients have certain rights in relation to their personal data, including the right:"
    ],
    bullets: [
      "To know what categories of data are collected and the purposes for which they are used.",
      "To request access to and correction of their personal information maintained with us.",
      "To withdraw consent for further processing of personal data, where processing is based solely on consent and not required under law or for legitimate purposes.",
      "To raise grievances, or request deletion or restriction of redundant data after completion of services, subject to legal retention requirements."
    ],
    closing:
      "For routine diagnostic tests, implied consent is considered to apply when a patient presents for testing or submits a prescription. For specialised tests (such as certain advanced, genetic or highly sensitive investigations), explicit written consent may be obtained in addition to routine consent."
  },
  {
    title: "9. Data Retention",
    paragraphs: [
      "Patient data is retained only as long as necessary to fulfil diagnostic, legal, regulatory, medico-legal, and reporting obligations, including quality assurance and audit requirements. Thereafter, data will be securely deleted, archived, or anonymised in accordance with applicable regulations and internal policies."
    ]
  },
  {
    title: "10. Cross-border Data Transfers",
    paragraphs: [
      "SDRC currently does not transfer patient data outside India in the ordinary course of operations. If, in the future, cross-border processing or cloud-based storage in other jurisdictions becomes necessary, SDRC will ensure compliance with the Digital Personal Data Protection Act, 2023 and any rules on cross-border data transfers, using only permitted mechanisms or government-approved jurisdictions."
    ]
  },
  {
    title: "11. Grievance and Contact",
    paragraphs: [
      "Patients may raise queries, concerns, or complaints related to data privacy and protection by contacting our designated Data Protection Officer (DPO):",
      "Data Protection Officer (DPO)\nSDRC Diagnostics LLP\nEmail: support@sdrc.in",
      "All grievances will be acknowledged within 7 working days and we aim to resolve them within 30 working days in line with the Digital Personal Data Protection Act, 2023 and applicable regulatory guidance."
    ]
  },
  {
    title: "12. Website Analytics and Session Tracking",
    paragraphs: [
      "To improve website performance, booking flow, and user experience, SDRC may collect website interaction events such as pages visited, search actions, add-to-cart actions, and session duration."
    ],
    bullets: [
      "We may use first-party browser storage (for example localStorage/sessionStorage) to assign an anonymous session identifier for analytics continuity during and across visits on the same browser.",
      "Such analytics may be linked to patient contact details only when you voluntarily submit booking/request forms.",
      "Analytics data is used for service optimisation, fraud/risk checks, troubleshooting, campaign effectiveness, and operational quality monitoring.",
      "Where legally required, SDRC will obtain appropriate consent and provide opt-out controls for non-essential analytics or marketing tracking."
    ]
  },
  {
    title: "13. Updates to This Policy",
    paragraphs: [
      "SDRC reserves the right to modify, amend or update this Privacy Policy from time to time to reflect changes in law, regulatory guidance, technology or operational practices. Updated versions will be made available at sdrc.in/privacy-policy.",
      "Continued use of SDRC services after such updates will be deemed as acceptance of the revised terms, to the extent permitted by applicable law."
    ]
  }
];

const references = [
  {
    label: "Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011",
    href: "https://www.indiacode.nic.in/handle/123456789/1362/simple-search?query=The+Information+Technology+(Reasonable+Security+Practices+and+Procedures+and+Sensitive+Personal+Data+or+Information)+Rules%2C+2011.&searchradio=rules"
  },
  {
    label: "Overview of Indian data protection framework",
    href: "https://www.dlapiperdataprotection.com/?t=law&c=IN"
  },
  {
    label: "Patient data privacy laws in India - overview",
    href: "https://www.easyclinic.io/understanding-what-are-the-patient-data-privacy-laws-in-india/"
  },
  {
    label: "Press information and notifications on DPDP Act",
    href: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2094604"
  },
  {
    label: "National Digital Health and health data guidance",
    href: "https://abdm.gov.in:8081/uploads/health_management_policy_bac9429a79.pdf"
  },
  {
    label: "Digital health legal landscape - India",
    href: "https://iclg.com/practice-areas/digital-health-laws-and-regulations/india"
  }
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" className="hero-title">
            SDRC Privacy Policy
            <Box as="span" color="teal.700" className="hero-subline">Data Protection and Patient Rights</Box>
          </Heading>
          <Text mt={3} color="gray.600" fontSize="sm">
            Last updated: 2026. This Privacy Policy applies to SDRC Diagnostics LLP and all services offered through our main centre and collection centres, websites and digital platforms.
          </Text>
        </Container>
      </Box>

      <Container maxW="1200px" py={10}>
        <Box className="soft-card" p={{ base: 5, md: 8 }}>
          <VStack align="stretch" gap={8}>
            {policySections.map((section) => (
              <Box key={section.title}>
                <Heading size="md" mb={2}>
                  {section.title}
                </Heading>

                {section.paragraphs?.map((p) => (
                  <Text key={p} fontSize="sm" color="gray.700" lineHeight={1.8} whiteSpace="pre-line" mb={2}>
                    {p}
                  </Text>
                ))}

                {section.bullets?.length ? (
                  <VStack align="stretch" gap={1} mb={2}>
                    {section.bullets.map((bullet) => (
                      <Text key={bullet} fontSize="sm" color="gray.700" lineHeight={1.8}>
                        • {bullet}
                      </Text>
                    ))}
                  </VStack>
                ) : null}

                {section.closing ? (
                  <Text fontSize="sm" color="gray.700" lineHeight={1.8}>
                    {section.closing}
                  </Text>
                ) : null}
              </Box>
            ))}

            <Box>
              <Heading size="md" mb={2}>
                References
              </Heading>
              <Text fontSize="sm" color="gray.700" mb={2}>
                The following publicly available resources and legal materials have informed SDRC&apos;s data protection approach and this Privacy Policy:
              </Text>
              <VStack align="stretch" gap={1}>
                {references.map((ref) => (
                  <Link key={ref.href} href={ref.href} target="_blank" rel="noopener noreferrer">
                    <Text fontSize="xs" color="teal.700">• {ref.label}</Text>
                  </Link>
                ))}
              </VStack>
            </Box>

            <Box borderTop="1px solid" borderColor="gray.200" pt={4}>
              <Text fontSize="xs" color="gray.500">Copyright © 2024 SDRC Diagnostics LLP - All rights reserved.</Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </>
  );
}
