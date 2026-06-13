import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../providers/theme-provider";
import { Toaster } from "sonner";
import NextAuthSessionProvider from "../providers/auth-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Veli",
  description: "Veli a sua melhor escola de idiomas online",
  icons: {
    icon: [
      {
        url: "/Veli_símbolo_positivo_sem_fundo_48x48.png",
        media: "(prefers-color-scheme: light)",
        sizes: "48x48",
      },
      {
        url: "/Veli_símbolo_negativo_sem_fundo_48x48.png",
        media: "(prefers-color-scheme: dark)",
        sizes: "48x48",
      },
      {
        url: "/Veli_símbolo_positivo_sem_fundo_48x48.png",
        sizes: "48x48",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextAuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextAuthSessionProvider>
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              padding: '16px',
              gap: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            className: 'backdrop-blur-sm',
          }}
        />
      </body>
    </html>
  );
}
