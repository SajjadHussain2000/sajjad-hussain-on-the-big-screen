import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, Caveat, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BugJar from "@/components/hunt/BugJar";
import Crawler from "@/components/hunt/Crawler";
import Guide from "@/components/Guide";
import { codeFor } from "@/lib/hunt-server";
import { site } from "@/lib/site";
import "./globals.css";

// Body: Plus Jakarta Sans (clean, very readable). Headings: Bricolage Grotesque (a bit of character). Accent: Caveat (handwritten).
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
// Not needed for first paint, so they don't compete with the body and heading fonts (better LCP).
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], preload: false });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.role}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website" },
};

// Runs before paint so the saved/system theme applies with no flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${bricolage.variable} ${caveat.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Guide />
        <Crawler />
        <BugJar />
        <Analytics />
        {/* Bug #8: a code word hiding in the page source */}
        <div hidden dangerouslySetInnerHTML={{ __html: `<!-- 🐛 You found me! Bug code: ${codeFor(8)} -->` }} />
      </body>
    </html>
  );
}
