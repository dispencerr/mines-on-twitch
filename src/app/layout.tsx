import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "destyle.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mines on Twitch",
  description: "Minesweeper-like game with Twitch integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Analytics />
        </body>
      </html>
    </Suspense>
  );
}
