import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "thirdweb SDK + Next starter",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 md:ml-64 ml-20 transition-all duration-300">
              <main className="p-4 max-w-3xl mx-auto">{children}</main>
            </div>
          </div>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
