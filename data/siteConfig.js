const env = {
  reportsUrl: process.env.NEXT_PUBLIC_REPORTS_URL,
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  internalNotifyNumber: process.env.NEXT_PUBLIC_INTERNAL_NOTIFY_WHATSAPP
};

export const siteConfig = {
  brand: "SDRC Diagnostics",
  phoneDisplay: "040 6600 4200",
  phoneTel: "+914066004200",
  whatsappNumber: env.whatsappNumber || "919849110001",
  internalNotifyNumber: env.internalNotifyNumber || env.whatsappNumber || "919849110001",
  bookingUrl: "/tests",
  reportsUrl: env.reportsUrl || "http://120.138.8.37:9999/shivam/onlinereporting/index.jsp",
  feedbackUrl: "https://sdrc.in/feedback",
  social: {
    facebook: "https://facebook.com/sdrc.in",
    instagram: "https://instagram.com/sdrc.in",
    x: "https://x.com/sdrcin",
    linktree: "https://linktr.ee/sdrcin"
  },
  apps: {
    android: "https://play.google.com/store/apps/details?id=com.shivam.sdrc&hl=en_IN",
    ios: "https://apps.apple.com/in/app/sdrc-my-health/id1584123917"
  },
  locations: {
    main: "https://maps.app.goo.gl/568UAthpfTsJd7Gn7",
    sdRoad: "https://maps.app.goo.gl/E3ymBXD1ptwAWTk6A",
    marredpally: "https://maps.app.goo.gl/B9S59F16Rhvb3bFg8",
    yapral: "https://maps.app.goo.gl/Yts1hfbMREEkVPQ77"
  },
  nabl: {
    enabled: true,
    certNo: "MC-7820",
    labCode: "M-5930",
    scopeUrl: "/assets/SDRC-NABL-Scope.pdf",
    certUrl: "/assets/SDRC-NABL-Certificate.pdf"
  },
  addressShort: "101, Jade Arcade (Corporate Block), Paradise, MG Road, Secunderabad",
  physiotherapyEnabled: true
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/accreditation", label: "Accreditation" },
  { href: "/physiotherapy", label: "Physiotherapy", flag: "physiotherapyEnabled" },
  { href: "/contact", label: "Contact" }
];
