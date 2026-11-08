import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from "@/components/ui/illustrated-icons";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`
  },
  description:
    "Plataforma de gestão das rotinas operacionais das lojas D&D: checklists, evidências fotográficas e indicadores.",
  applicationName: APP_NAME,
  icons: {
    icon: "/brand/logo-dd-mark.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12D9EF"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {children}
        <Toaster
          position="top-right"
          icons={{
            success: <CheckCircle2 className="h-5 w-5" />,
            error: <XCircle className="h-5 w-5" />,
            info: <Info className="h-5 w-5" />,
            warning: <AlertTriangle className="h-5 w-5" />,
            loading: <Loader2 className="h-5 w-5 animate-spin" />
          }}
          toastOptions={{
            style: {
              border: "1px solid rgb(var(--color-border))",
              color: "rgb(var(--color-text))",
              background: "rgb(var(--color-surface))",
              fontFamily: "var(--font-body)",
              borderRadius: "var(--radius-card)"
            }
          }}
        />
      </body>
    </html>
  );
}


