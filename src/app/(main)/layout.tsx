import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/app/(main)/componentes/navbar";
import Footer from "@/components/ui/footer";
import TanstackProvider from "../../../providers/TanstackProvider";

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
      <body className="flex flex-col h-dvh min-h-full w-full">
        <TanstackProvider>
          <section className={inter.className}>
            <Navbar />
            <div className="absolute bottom-2/4 w-full">
              {children}
            </div>
            <div className="absolute bottom-0 w-full">
              <Footer />
            </div>
          </section>
        </TanstackProvider>
      </body>
    </html>
  );
}
