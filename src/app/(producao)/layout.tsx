import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import TanstackProvider from "../../../providers/TanstackProvider";
import StoreProvider from "../StoreProvider";
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
      <body className={inter.className}>
        <TanstackProvider>
          <section>
            <StoreProvider>{children}</StoreProvider>
          </section>
        </TanstackProvider>
        <Toaster />
      </body>
    </html>
  );
}
