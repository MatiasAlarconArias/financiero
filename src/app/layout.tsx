import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MacroPulse LATAM | Indicadores económicos",
  description: "Indicadores económicos de América Latina con datos abiertos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
