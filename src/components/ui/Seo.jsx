import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const pages = {
  "/": { title: "Autoestética Tucumán | Detailing automotriz", description: "Lavado premium, limpieza interior, abrillantado y tratamientos cerámicos en Tucumán." },
  "/servicios": { title: "Servicios de detailing | Autoestética Tucumán", description: "Conocé nuestros servicios de estética vehicular para autos, camionetas, motos y bicicletas." },
  "/galeria": { title: "Trabajos realizados | Autoestética Tucumán", description: "Resultados reales de lavado, restauración y protección vehicular realizados en nuestro taller." },
  "/consulta": { title: "Solicitar presupuesto | Autoestética Tucumán", description: "Consultá por el tratamiento indicado para tu vehículo y coordiná tu próximo turno." },
  "/contacto": { title: "Contacto | Autoestética Tucumán", description: "Contactanos por WhatsApp y coordiná tu servicio de detailing en Tucumán." },
  "/privacidad": { title: "Política de privacidad | Autoestética Tucumán", description: "Información sobre el tratamiento y protección de datos personales." },
  "/terminos": { title: "Condiciones del servicio | Autoestética Tucumán", description: "Condiciones generales aplicables a consultas, turnos y servicios de detailing." },
};

function setMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) { element = document.createElement("meta"); document.head.appendChild(element); }
  element.setAttribute(attribute, value);
}

export default function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = pages[pathname] || (pathname.startsWith("/servicios/") ? { title: "Detalle del servicio | Autoestética Tucumán", description: "Información, beneficios, precios y consulta de nuestros tratamientos de detailing automotriz." } : pathname.startsWith("/admin") ? { title: "Panel administrador | Autoestética Tucumán", description: "Gestión interna de Autoestética Tucumán." } : pages["/"]);
    const isAdmin = pathname.startsWith("/admin");
    document.title = page.title;
    setMeta('meta[name="description"]', "name", "description");
    document.head.querySelector('meta[name="description"]').setAttribute("content", page.description);
    setMeta('meta[name="robots"]', "name", "robots");
    document.head.querySelector('meta[name="robots"]').setAttribute("content", isAdmin ? "noindex,nofollow" : "index,follow");
    [["og:title", page.title], ["og:description", page.description], ["og:type", "website"], ["og:url", window.location.href]].forEach(([property, content]) => { setMeta(`meta[property="${property}"]`, "property", property); document.head.querySelector(`meta[property="${property}"]`).setAttribute("content", content); });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}${pathname}`;
  }, [pathname]);
  return null;
}
