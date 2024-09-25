import type { Metadata } from "next";
import "./globals.css";
import { roboto } from "../utils/fonts";

export const metadata: Metadata = {
  title: "Flavio's Cube Archive",
  description: "Archive with all the stored cubes",
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
