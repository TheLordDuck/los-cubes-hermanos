import type { Metadata } from "next";
import "./globals.css";
import { roboto } from "../utils/fonts";

export const metadata: Metadata = {
  title: "Los Cubes Hermanos",
  description: "Archive with all the stored cubes with my brother :D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
