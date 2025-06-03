import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
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
      <body>
        <section className={inter.className}>
        <TanstackProvider>{children}</TanstackProvider>
          </section>
      </body>
    </html>
  );
}
