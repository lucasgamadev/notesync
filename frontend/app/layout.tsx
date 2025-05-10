import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from '@/src/components/ClientLayout';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

// Metadados movidos para app/metadata.ts

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
