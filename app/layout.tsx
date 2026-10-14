import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Resource Reservation System",
  description: "Manage shared resources and conflict-free reservations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
