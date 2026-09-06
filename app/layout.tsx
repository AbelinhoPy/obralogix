import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ObraLogix | SaaS de Gestión de Obras, Cuadrillas y Servicios Técnicos",
  description: "Plataforma integral para constructoras y contratistas eléctricos: pase de lista, diarias, bitácora de obra, pañol de herramientas QR y seguimiento de tableros eléctricos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full bg-[#12151b] antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#12151b] text-[#F4F1EA] selection:bg-[#FF6A1F] selection:text-[#181205]">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
