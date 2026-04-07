import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata = {
  title: "SDRC Diagnostics",
  description: "Advanced diagnostic centre at Jade Arcade, Secunderabad.",
  icons: {
    icon: "/assets/favicon.ico",
    apple: "/assets/apple-touch-icon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
