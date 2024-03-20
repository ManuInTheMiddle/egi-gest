import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import StoreProvider from "../StoreProvider";
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
      <body className={inter.className}>
        <section>
          <TanstackProvider>
            <StoreProvider>{children}</StoreProvider>
          </TanstackProvider>
        </section>
      </body>
    </html>
  );
}
