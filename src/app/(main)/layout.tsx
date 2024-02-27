import type { Metadata } from "next";
import { Inter } from "next/font/google";
<<<<<<< HEAD
=======
//import "./globals.css";
>>>>>>> f31ea30fbfd392dbede6a5971c72b3040a3dd7d5
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
