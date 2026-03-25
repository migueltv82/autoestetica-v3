import { Sparkles, Droplets, ShieldCheck, Bike, CarFront } from "lucide-react";
import "./ServicesGrid.css";

const servicesList = [
  {
    icon: <CarFront size={26} />,
    title: "Lavado premium",
    description: "Limpieza exterior con terminación prolija para una mejor presencia general.",
    duration: "de 4 a 6 horas",
  },
  {
    icon: <Droplets size={26} />,
    title: "Limpieza de interior",
    description: "Limpieza profunda de habitáculo, superficies y detalles internos.",
    duration: "2 dias",
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Pulido y abrillantado",
    description: "Tratamiento estético para mejorar brillo, uniformidad y terminación.",
    duration: "Según evaluación",
  },
  {
    icon: <Sparkles size={26} />,
    title: "Lavado de motor",
    description: "Limpieza estética de motor con cuidado y criterio.",
    duration: "2 horas",
  },
  {
    icon: <Bike size={26} />,
    title: "Lavado y detallado de motos",
    description: "Trabajo detallado para motos, con limpieza estética y terminación cuidada.",
    duration: "3 horas",
  },
  {
    icon: <Bike size={26} />,
    title: "Lavado y detallado de bicicletas",
    description: "Limpieza y cuidado visual para bicicletas de uso urbano o deportivo.",
    duration: "1:30 horas",
  },
];

function ServicesGrid() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <span className="section-kicker">Catálogo</span>
          <h1 className="section-title">Servicios disponibles</h1>
          <p className="section-text">
            Cada servicio se coordina de manera personalizada para asegurar una
            atención más precisa y un mejor resultado final.
          </p>
        </div>

        <div className="services-grid">
          {servicesList.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-card-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="service-card-duration">{service.duration}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesGrid;