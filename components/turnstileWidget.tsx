"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

interface TurnstileOptions {
  sitekey: string;
  action?: string;
  appearance?: "always" | "execute" | "interaction-only";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "refresh-expired"?: "auto" | "manual" | "never";
  theme?: "light" | "dark" | "auto";
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onError: () => void;
  onVerify: (token: string | null) => void;
  resetSignal: number;
}

export default function TurnstileWidget({
  siteKey,
  onError,
  onVerify,
  resetSignal,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onErrorRef = useRef(onError);
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onErrorRef.current = onError;
    onVerifyRef.current = onVerify;
  }, [onError, onVerify]);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: "contact_form",
      appearance: "interaction-only",
      theme: "auto",
      "refresh-expired": "auto",
      callback: (token) => onVerifyRef.current(token),
      "error-callback": () => {
        onVerifyRef.current(null);
        onErrorRef.current();
      },
      "expired-callback": () => onVerifyRef.current(null),
      "timeout-callback": () => onVerifyRef.current(null),
    });
  }, [siteKey]);

  useEffect(() => {
    renderWidget();

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={containerRef} aria-label="Human verification" />
    </>
  );
}
