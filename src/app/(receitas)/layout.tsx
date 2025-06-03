import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import TanstackProvider from "../../../providers/TanstackProvider";
const inter = Inter({ subsets: ["latin"] });
import { Toaster } from "@/components/ui/sonner";

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
      <body className={inter.className}>
        <section>
          <TanstackProvider>{children}</TanstackProvider>
          <Toaster closeButton />
        </section>
      </body>
    </html>
  );
}
