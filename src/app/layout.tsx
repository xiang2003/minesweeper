import type { Metadata, Viewport } from "next";
import BackgroundMusic from "@/components/BackgroundMusic";
import LangSync from "@/components/LangSync";
import LoadingScreen from "@/components/LoadingScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mosaic Puzzle",
  description: "A calm logic puzzle: fill cells to match the clues and reveal a hidden picture.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <LangSync />
        <BackgroundMusic />
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
