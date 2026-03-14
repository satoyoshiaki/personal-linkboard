import "./globals.css";
import { getProfile } from "../lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const profile = getProfile();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(baseUrl),
    title: profile.seoTitle,
    description: profile.seoDescription,
    openGraph: {
      title: profile.seoTitle,
      description: profile.seoDescription,
      type: "website",
      url: baseUrl,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: profile.seoTitle,
      description: profile.seoDescription,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
    icons: profile.faviconUrl
      ? {
          icon: profile.faviconUrl,
          shortcut: profile.faviconUrl,
          apple: profile.faviconUrl,
        }
      : undefined,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
