import { useEffect, useRef } from "react";
import "./TurnstileWidget.css";

const SCRIPT_ID = "cloudflare-turnstile-script";

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    const onReady = () => window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile no disponible"));
    if (existing) { existing.addEventListener("load", onReady, { once: true }); return; }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", () => reject(new Error("No se pudo cargar la verificación")), { once: true });
    document.head.appendChild(script);
  });
}

export default function TurnstileWidget({ onToken, resetKey }) {
  const containerRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    let active = true;
    let widgetId;
    onToken("");
    if (!siteKey || !containerRef.current) return undefined;
    loadTurnstile().then((turnstile) => {
      if (!active || !containerRef.current) return;
      widgetId = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        size: "flexible",
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    }).catch(() => onToken(""));
    return () => {
      active = false;
      if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken, resetKey, siteKey]);

  if (!siteKey) return <p className="inquiry-captcha-error" role="alert">La verificación de seguridad todavía no está configurada.</p>;
  return <div className="inquiry-turnstile" ref={containerRef} />;
}
