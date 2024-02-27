import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import Options from "@/components/ui/options";
import Providers from "@/components/ui/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MESlette",
  description: "Controlador de paletes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar">
      <Providers>
        <section className={inter.className}>
          <Navbar />
          <Options />
          {children}
          <Footer />
        </section>
      </Providers>
    </html>
  );
}
