import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dash0-logs.vercel.app"),
  title: "Logy | Dash0",
  description:
    "A production-grade, high-performance OTLP Log Viewer interface.",
  applicationName: "Logy",
  keywords: ["OTLP", "Logs", "Observability", "Dash0", "Next.js", "React"],
  authors: [{ name: "Dash0" }],
  creator: "Dash0",
  publisher: "Dash0",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Logy | Dash0",
    description:
      "A production-grade, high-performance OTLP Log Viewer interface.",
    url: "https://dash0-logs.vercel.app",
    siteName: "Logy",
    images: [
      {
        url: "/icon.png",
        width: 1024,
        height: 1024,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
