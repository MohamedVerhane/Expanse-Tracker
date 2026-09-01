import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { Toaster } from "sonner";
import { getLocale } from "@/lib/locale";
import { getDir, translate } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";

config.autoAddCss = false;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const siteUrl = getSiteUrl();
  const title = translate(locale, "app.title");
  const description = translate(locale, "app.description");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: translate(locale, "seo.titleTemplate"),
    },
    description,
    applicationName: translate(locale, "app.title"),
    keywords: translate(locale, "seo.keywords")
      .split(",")
      .map((k) => k.trim()),
    category: "finance",
    authors: [{ name: "Expense Tracker" }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "/",
      languages: {
        en: siteUrl,
        ar: siteUrl,
        "x-default": siteUrl,
      },
    },
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_AR",
      url: `${siteUrl}/`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dir = getDir(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full antialiased">
        <ThemeProvider>
          <LocaleProvider locale={locale}>{children}</LocaleProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
