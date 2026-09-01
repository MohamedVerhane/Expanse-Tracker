import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getLocale } from "@/lib/locale";
import { translate } from "@/lib/i18n";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getLocale();
  const base = getSiteUrl();

  return {
    name: translate(locale, "app.title"),
    short_name: "ExT",
    description: translate(locale, "app.description"),
    start_url: `${base}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    categories: ["finance", "productivity"],
    icons: [
      { src: `${base}/icon`, sizes: "any", type: "image/png" },
      { src: `${base}/apple-icon`, sizes: "180x180", type: "image/png" },
    ],
  };
}