import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bankmonitor AI Workshop — Live Quiz",
  description: "Élő kvíz a Bankmonitor AI Workshop II. napjához",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
