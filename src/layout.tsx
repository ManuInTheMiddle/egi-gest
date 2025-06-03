import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

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
    <html lang="en" className="no-scrollbar h-full min-h-full">
      <body>
        <section className={inter.className}>{children}</section>
      </body>
    </html>
  );
}
