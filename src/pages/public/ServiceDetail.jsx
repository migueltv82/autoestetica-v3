import { ArrowLeft, CheckCircle2, Clock3, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import Carousel from "../../components/ui/Carousel";
import Loader from "../../components/ui/Loader";
import { useServices } from "../../hooks/useServices";
import { useSettings } from "../../hooks/useSettings";
import { getServicePreviewGallery, classifyService } from "../../utils/serviceMedia";
import { isTwoWheelService } from "../../utils/servicePricing";
import { serviceSlug } from "../../utils/serviceSlug";
import "./ServiceDetail.css";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const CONTENT = {
  interior:{ benefits:["Higiene profunda de tapizados y alfombras","Limpieza segura de plásticos y superficies","Mejora visible del ambiente interior"], steps:["Inspección y aspirado técnico","Tratamiento según cada material","Secado y revisión final"], care:"Permití una ventilación adecuada después del trabajo y evitá derrames durante las primeras horas." },
  protection:{ benefits:["Mayor brillo y profundidad visual","Protección frente a contaminantes","Mantenimiento cotidiano más sencillo"], steps:["Diagnóstico del estado de la pintura","Preparación y corrección necesaria","Aplicación y curado de la protección"], care:"Respetá el tiempo de curado indicado y evitá lavar el vehículo con productos agresivos." },
  exterior:{ benefits:["Remoción segura de suciedad acumulada","Terminación uniforme y cuidada","Protección de superficies sensibles"], steps:["Prelavado y descontaminación inicial","Limpieza detallada por sectores","Secado seguro y terminación"], care:"Para conservar el resultado, utilizá métodos de lavado seguros y evitá detergentes domésticos." },
  technical:{ benefits:["Limpieza de sectores de difícil acceso","Productos adecuados para cada componente","Terminación técnica y controlada"], steps:["Evaluación y protección de componentes","Limpieza técnica localizada","Secado, terminación y control"], care:"Seguí las indicaciones entregadas según los componentes tratados." },
  other:{ benefits:["Proceso adaptado al estado del vehículo","Productos de uso profesional","Revisión final antes de la entrega"], steps:["Evaluación inicial","Ejecución del tratamiento","Control de terminación"], care:"Te indicaremos los cuidados adecuados al finalizar el servicio." },
};

export default function ServiceDetail(){
  const { slug } = useParams(); const { services,isLoading }=useServices(); const {settings}=useSettings();
  if(isLoading) return <Loader/>;
  const service=services.find(item=>serviceSlug(item.name)===slug);
  if(!service) return <Navigate to="/servicios" replace/>;
  const content=CONTENT[classifyService(service)]||CONTENT.other; const gallery=getServicePreviewGallery(service);
  const whatsapp=`https://wa.me/${String(settings.whatsapp||"5493815448147").replace(/\D/g,"")}?text=${encodeURIComponent(`Hola, quiero consultar por el servicio ${service.name}.`)}`;
  const price=service.display?.price===false||service.priceOnRequest||(!service.carPrice&&!service.truckPrice)?<strong>Precio a consultar</strong>:isTwoWheelService(service)?<strong>{money.format(service.carPrice)}</strong>:<><span>Auto <strong>{money.format(service.carPrice)}</strong></span><span>Camioneta <strong>{money.format(service.truckPrice)}</strong></span></>;
  return <PageTransition><PublicLayout><main className="service-detail"><section className="container service-detail-hero"><div><Link className="service-back" to="/servicios"><ArrowLeft size={16}/> Todos los servicios</Link><span className="service-detail-kicker">{service.category||"Detailing profesional"}</span><h1>{service.name}</h1><p>{service.description}</p><div className="service-detail-meta"><span><Clock3 size={17}/>{service.duration}</span><span><ShieldCheck size={17}/>Proceso profesional</span></div><div className="service-detail-price">{price}</div><a className="service-detail-wa" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={19}/>Consultar este tratamiento</a></div><div className="service-detail-gallery"><Carousel images={gallery}/></div></section><section className="container service-detail-content"><article><span><Sparkles size={19}/></span><h2>Qué aporta</h2><ul>{content.benefits.map(item=><li key={item}><CheckCircle2 size={16}/>{item}</li>)}</ul></article><article><span><ShieldCheck size={19}/></span><h2>Cómo trabajamos</h2><ol>{content.steps.map((item,index)=><li key={item}><b>0{index+1}</b>{item}</li>)}</ol></article><article className="service-care"><h2>Cuidados posteriores</h2><p>{content.care}</p></article></section><section className="service-detail-cta"><div className="container"><div><span>¿No sabés si es el tratamiento indicado?</span><h2>Evaluamos tu vehículo antes de recomendarte una opción.</h2></div><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18}/>Hablar por WhatsApp</a></div></section></main></PublicLayout></PageTransition>;
}
