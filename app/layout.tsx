import type { Metadata } from "next";
import { geistSans, geistMono } from "../fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapperton Church of England Primary School",
  description: "Sapperton Church of England Primary School",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <body
        className={`antialiased ${geistSans.variable} ${geistMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
