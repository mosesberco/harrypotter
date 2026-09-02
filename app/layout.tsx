import type { Metadata } from "next";
import { Frank_Ruhl_Libre, David_Libre, EB_Garamond } from "next/font/google";
import { Providers } from "@/lib/i18n";
import Grain from "@/components/Grain";
import Chrome from "@/components/Chrome";
import "./globals.css";

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  variable: "--f-frank",
  display: "swap",
});

const david = David_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--f-david",
  display: "swap",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--f-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "מאה ארבעים ושתיים · חידון לפוטרהדים",
  description:
    "חידון הארי פוטר בחמש רמות קושי, על שבעת הספרים ושמונת הסרטים. כל תשובה עם מקור.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" data-theme="light">
      <body className={`${frank.variable} ${david.variable} ${garamond.variable}`}>
        <Providers>
          <Grain />
          <Chrome>{children}</Chrome>
        </Providers>
      </body>
    </html>
  );
}
