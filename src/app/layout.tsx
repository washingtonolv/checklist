import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`
  },
  description:
    "Plataforma de gestão das rotinas operacionais das lojas D&D: checklists, evidências fotográficas e indicadores.",
  applicationName: APP_NAME,
  icons: {
    icon: "/brand/logo-dd-mark.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12D9EF"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              border: "1px solid rgba(137,23,69,0.16)",
              color: "#891745",
              borderRadius: "14px"
            }
          }}
        />
      </body>
    </html>
  );
}

