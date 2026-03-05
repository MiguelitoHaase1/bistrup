import type { Metadata } from "next";
import CommentLayer from "@/components/CommentLayer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bistrup Byggeprojekt",
  description: "Byggeprojekt — Bistrupgårdsvej 1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream min-h-screen">
        <CommentLayer>{children}</CommentLayer>
      </body>
    </html>
  );
}
