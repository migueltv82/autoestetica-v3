import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import { Wrench, Plus, Edit2, Trash2, Clock, Zap, Info, Star, Image as ImageIcon, Camera } from "lucide-react";
import { motion } from "framer-motion";
import businessLogo from "../../assets/logo.jpg";
import Modal from "../../components/ui/Modal";
import Carousel from "../../components/ui/Carousel";

const INITIAL_SERVICES = [
  { 
    id: 1, 
    name: "Lavado Premium", 
    price: 15000, 
    duration: "2h", 
    description: "Lavado detallado con cera rápida y aspirado profundo de tapizados y alfombras.", 
    icon: <Zap size={22} />, 
    featured: true,
    gallery: [
      { url: "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=1470&auto=format&fit=crop", label: "Finalizado" },
      { url: "https://images.unsplash.com/photo-1542462662-e17ee96c262d?q=80&w=1470&auto=format&fit=crop", label: "Proceso" },
    ]
  },
  { 
    id: 2, 
    name: "Limpieza de Interior", 
    price: 25000, 
    duration: "4h", 
    description: "Limpieza textil, cueros y plásticos con protección UV y nutrición de superficies.", 
    icon: <Info size={22} />,
    gallery: []
  },
  { 
    id: 3, 
    name: "Tratamiento Acrílico", 
    price: 45000, 
    duration: "6h", 
    description: "Corrección de micro-rayas (swirls), abrillantado profundo y sellado acrílico protector.", 
    icon: <Zap size={22} />, 
    featured: true,
    gallery: []
  },
  { 
    id: 4, 
    name: "Lavado de Motor", 
    price: 8500, 
    duration: "1h", 
    description: "Limpieza técnica de motor a vapor con productos dieléctricos y terminación satinada.", 
    icon: <Zap size={22} />,
    gallery: []
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { y: -8, transition: { duration: 0.3, ease: "easeInOut" } }
};

function AdminServices() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [editingGallery, setEditingGallery] = useState(null);
  const formatMoney = (val) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(val);

  const openGalleryManager = (service) => {
    setEditingGallery(service);
  };

  const closeGalleryManager = () => {
    setEditingGallery(null);
  };

  const addMockImage = () => {
    if (!editingGallery) return;
    const mockImage = { 
      url: "https://images.unsplash.com/photo-1574067332341-35f11e967a5b?q=80&w=1470&auto=format&fit=crop", 
      label: "Nueva Foto" 
    };
    
    setServices(prev => prev.map(s => 
      s.id === editingGallery.id 
        ? { ...s, gallery: [...s.gallery, mockImage] } 
        : s
    ));
    // Update local editing state too
    setEditingGallery(prev => ({ ...prev, gallery: [...prev.gallery, mockImage] }));
  };

  return (
    <PageTransition>
      <AdminLayout
        title="Gestión de Servicios"
        subtitle="Administrá tu catálogo de servicios, precios y galerías de fotos."
      >
        <div style={{ position: "relative", minHeight: "80vh" }}>
          
          <div style={{ 
            position: "fixed", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            opacity: 0.04, 
            width: "min(60vw, 800px)",
            pointerEvents: "none",
            zIndex: 0,
            filter: "grayscale(1) brightness(1.5)"
          }}>
            <img src={businessLogo} alt="Autoestética Watermark" style={{ width: "100%", height: "auto" }} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem", gap: "2rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <Star size={24} className="text-secondary" style={{ fill: "var(--color-secondary)", opacity: 0.8 }} />
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Catálogo Operativo</h2>
                </div>
                <p style={{ color: "var(--color-text-soft)", fontSize: "1.05rem", maxWidth: "600px", lineHeight: "1.6" }}>
                  Definí los estándares de calidad y las fotos que verán tus clientes.
                </p>
              </div>
              <button className="btn-premium" style={{ minWidth: "200px", justifyContent: "center", height: "56px", fontSize: "1rem" }}>
                <Plus size={22} /> Nuevo Servicio
              </button>
            </div>

            <motion.div 
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "2.5rem" }}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {services.map(service => (
                <motion.div 
                  key={service.id} 
                  className="dashboard-panel" 
                  variants={cardVariants}
                  whileHover="hover"
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "1.75rem",
                    position: "relative",
                    overflow: "hidden",
                    border: service.featured ? "1px solid rgba(0, 191, 166, 0.4)" : "1px solid var(--color-border)",
                    boxShadow: service.featured ? "0 10px 40px rgba(0, 191, 166, 0.1)" : "none",
                    background: service.featured ? "rgba(0, 191, 166, 0.02)" : "rgba(255, 255, 255, 0.02)"
                  }}
                >
                  {service.featured && (
                    <div style={{ position: "absolute", top: "1rem", right: "-2.5rem", background: "var(--color-primary)", color: "#000", fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", padding: "0.25rem 2.5rem", transform: "rotate(45deg)", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                      Popular
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ 
                      width: "60px", 
                      height: "60px", 
                      borderRadius: "18px", 
                      background: "rgba(0, 191, 166, 0.15)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      color: "var(--color-primary)",
                      boxShadow: "0 8px 16px rgba(0, 191, 166, 0.1)",
                      border: "1px solid rgba(0, 191, 166, 0.3)"
                    }}>
                      {service.icon}
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button 
                        className="btn-ghost btn-mini-action" 
                        title="Gestionar Fotos"
                        onClick={() => openGalleryManager(service)}
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button className="btn-ghost btn-mini-action" title="Editar"><Edit2 size={18} /></button>
                      <button className="btn-danger btn-mini-action" title="Eliminar"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.85rem", color: "var(--color-white)", letterSpacing: "-0.01em" }}>{service.name}</h3>
                    <p style={{ fontSize: "1rem", color: "var(--color-text-soft)", lineHeight: "1.7", minHeight: "3.5rem" }}>{service.description}</p>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    paddingTop: "1.5rem", 
                    marginTop: "auto",
                    borderTop: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                       <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tiempo Estimado</span>
                       <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", color: "var(--color-text)", fontWeight: 700 }}>
                        <Clock size={16} className="text-secondary" /> {service.duration}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                       <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Inversión</span>
                       <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--color-primary)", letterSpacing: "-0.04em", lineHeight: "1" }}>
                        {formatMoney(service.price)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <Modal
          isOpen={!!editingGallery}
          onClose={closeGalleryManager}
          title={`Galería: ${editingGallery?.name}`}
          maxWidth="1000px"
        >
          {editingGallery && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <Carousel images={editingGallery.gallery} />
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className="btn-premium" onClick={addMockImage}>
                    <Camera size={18} /> Añadir Foto
                  </button>
                  <button className="btn-ghost" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Trash2 size={16} /> Limpiar Todo
                  </button>
                </div>
              </div>
              <div className="dashboard-panel section-sm" style={{ height: "fit-content" }}>
                <h4 style={{ color: "var(--color-white)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Info size={16} className="text-primary" /> Info de Gestión
                </h4>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-soft)", lineHeight: "1.6" }}>
                  Las fotos que subas aquí serán visibles en el carrusel público cuando un cliente haga clic en el servicio. <br/><br/>
                  Se recomienda usar imágenes de alta calidad (JPG/PNG) y formato 16:9.
                </p>
                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "12px", fontSize: "0.85rem" }}>
                  <strong>Fotos actuales:</strong> {editingGallery.gallery.length}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </AdminLayout>
    </PageTransition>
  );
}

export default AdminServices;