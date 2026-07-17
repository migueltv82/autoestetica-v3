import { useMemo } from "react";
import { motion } from "framer-motion";
import { useServices } from "../../hooks/useServices";
import { useSettings } from "../../hooks/useSettings";
import ServiceSalesCard from "./ServiceSalesCard";
import "./ServicesGrid.css";

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-50px" }, transition: { duration: .55, ease: [0.16, 1, .3, 1] } };

export default function ServicesGrid() {
  const { services } = useServices();
  const { settings } = useSettings();
  const orderedServices = useMemo(() => [...(services || [])].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))), [services]);
  return <div className="services-catalog-modern"><header className="catalog-header"><div className="container"><motion.span className="catalog-kicker" {...FADE_UP}>Servicios</motion.span><motion.h1 {...FADE_UP}>Tratamientos profesionales</motion.h1><motion.p {...FADE_UP}>Soluciones pensadas para proteger, realzar y mantener cada detalle de tu vehículo.</motion.p></div></header><section className="container catalog-grid">{orderedServices.map((service, index) => <motion.div key={service.id} {...FADE_UP} transition={{ delay: index * .05 }}><ServiceSalesCard service={service} whatsappNumber={settings.whatsapp} /></motion.div>)}</section></div>;
}
