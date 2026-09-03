"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/* ---------- Google Analytics 4 ---------- *
 * The only thing needed to switch this on is NEXT_PUBLIC_GA_ID
 * (the "G-XXXXXXXXXX" measurement id) in the Vercel project's
 * environment variables. Without it nothing is loaded at all.   */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Report an event to GA4. A no-op when analytics is off. */
export function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}

/* The queue and the config are opened inline, while the document is parsed, so
   that everything sent later — first page view included — lands after them. */
const init = `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
window.gtag=gtag;
gtag('js',new Date());
gtag('config','${GA_ID}',{send_page_view:false});`;

/** Client-side navigation doesn't reload the page, so page views are sent by hand. */
function PageViews() {
  const path = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const q = params.toString();
    window.gtag("event", "page_view", {
      page_path: q ? `${path}?${q}` : path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [path, params]);

  return null;
}

export default function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: init }} />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
    </>
  );
}
