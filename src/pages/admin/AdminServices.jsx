import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import {
  Plus, Edit2, Trash2, Clock, Info, Star, Image as ImageIcon,
  Camera, X, Eye, EyeOff, Check, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../components/ui/Modal";
import Carousel from "../../components/ui/Carousel";
import { useServices } from "../../hooks/useServices";
import { getIcon, getAvailableIcons } from "../../utils/iconMapper";
import "./AdminServices.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
  hover: { y: -6, transition: { duration: 0.25, ease: "easeInOut" } },
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  duration: "",
  iconName: "Zap",
  featured: false,
  display: { name: true, description: true, gallery: true, duration: true, price: true },
  gallery: [],
};

const VISIBILITY_LABELS = {
  name: "Nombre del servicio",
  description: "Descripción",
  gallery: "Galería de trabajos",
  duration: "Duración estimada",
  price: "Precio",
};

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="svc-toggle-row">
      <span className="svc-toggle-label">{label}</span>
      <button
        type="button"
        className={`svc-toggle ${checked ? "on" : "off"}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span className="svc-toggle-knob" />
      </button>
      <span className={`svc-toggle-status ${checked ? "visible" : "hidden"}`}>
        {checked ? <Eye size={14} /> : <EyeOff size={14} />}
        {checked ? "Visible" : "Oculto"}
      </span>
    </label>
  );
}

function AdminServices() {
  const {
    services, addService, updateService, deleteService,
    toggleFeatured, updateVisibility,
  } = useServices();

  const [editingService, setEditingService] = useState(null); // edit modal
  const [editingGallery, setEditingGallery] = useState(null); // gallery modal
  const [form, setForm] = useState(emptyForm);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);

  const formatMoney = (val) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(val);

  // ----------- Edit / New -------------
  const openNew = () => {
    setForm(emptyForm);
    setEditingService("new");
    setShowVisibility(false);
    setShowIconPicker(false);
  };

  const openEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      iconName: service.iconName,
      featured: service.featured || false,
      display: { ...service.display },
      gallery: [...service.gallery],
    });
    setEditingService(service.id);
    setShowVisibility(false);
    setShowIconPicker(false);
  };

  const closeEdit = () => {
    setEditingService(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.name || !form.duration) return;
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
    };
    if (editingService === "new") {
      addService(payload);
    } else {
      updateService(editingService, payload);
    }
    closeEdit();
  };

  const setDisplayField = (key, val) => {
    setForm(prev => ({ ...prev, display: { ...prev.display, [key]: val } }));
  };

  // ----------- Gallery ----------------
  const openGallery = (service) => setEditingGallery(service);
  const closeGallery = () => setEditingGallery(null);

  const addMockImage = () => {
    if (!editingGallery) return;
    const mockImage = {
      url: "https://images.unsplash.com/photo-1574067332341-35f11e967a5b?q=80&w=1470&auto=format&fit=crop",
      label: "Nueva Foto",
    };
    const updated = { ...editingGallery, gallery: [...editingGallery.gallery, mockImage] };
    updateService(editingGallery.id, { gallery: updated.gallery });
    setEditingGallery(updated);
  };

  const clearGallery = () => {
    if (!editingGallery) return;
    updateService(editingGallery.id, { gallery: [] });
    setEditingGallery({ ...editingGallery, gallery: [] });
  };

  const isNew = editingService === "new";
  const currentService = !isNew && services.find(s => s.id === editingService);

  return (
    <PageTransition>
      <AdminLayout
        title="Gestión de Servicios"
        subtitle="Administrá tu catálogo, precios, visibilidad y galerías de fotos."
      >
        <div className="admin-services-container">
          <div className="admin-services-content">

            {/* ---- Header ---- */}
            <div className="admin-services-header">
              <div className="admin-services-title-box">
                <div className="admin-services-title-inner">
                  <Star size={22} style={{ color: "var(--color-primary)", opacity: 0.85 }} />
                  <h2>Catálogo Operativo</h2>
                </div>
                <p>Cada servicio tiene control individual de visibilidad. Lo que activás aquí se refleja en el sitio público.</p>
              </div>
              <button className="btn-premium svc-new-btn" onClick={openNew}>
                <Plus size={20} /> <span>Nuevo Servicio</span>
              </button>
            </div>

            {/* ---- Service Cards Grid ---- */}
            <motion.div
              className="admin-services-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {services.map(service => (
                <motion.div
                  key={service.id}
                  className={`dashboard-panel service-card-premium ${service.featured ? "featured" : ""}`}
                  variants={cardVariants}
                  whileHover="hover"
                >
                  {service.featured && <div className="featured-ribbon">Popular</div>}

                  {/* Top row */}
                  <div className="svc-card-top">
                    <div className="service-icon-box">
                      {getIcon(service.iconName, { size: 24 })}
                    </div>
                    <div className="svc-card-actions">
                      <button
                        className="btn-ghost btn-mini-action"
                        title="Galería de fotos"
                        onClick={() => openGallery(service)}
                      >
                        <ImageIcon size={16} />
                        {service.gallery?.length > 0 && (
                          <span className="svc-gallery-count">{service.gallery.length}</span>
                        )}
                      </button>
                      <button
                        className={`btn-mini-action ${service.featured ? "btn-primary-mini" : "btn-ghost"}`}
                        title={service.featured ? "Quitar de destacados" : "Marcar como destacado"}
                        onClick={() => toggleFeatured(service.id)}
                      >
                        <Star size={16} fill={service.featured ? "currentColor" : "none"} />
                      </button>
                      <button className="btn-ghost btn-mini-action" title="Editar" onClick={() => openEdit(service)}>
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-danger btn-mini-action"
                        title="Eliminar"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar "${service.name}"?`)) deleteService(service.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <h3 className="service-card-title">{service.name}</h3>
                    <p className="service-card-desc">{service.description}</p>
                  </div>

                  {/* Footer */}
                  <div className="service-card-footer">
                    <div>
                      <span className="service-meta-label">Duración</span>
                      <div className="service-duration-val">
                        <Clock size={15} style={{ color: "var(--color-primary)" }} />
                        {service.duration}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="service-meta-label">Precio</span>
                      <div className="service-price-val">{formatMoney(service.price)}</div>
                    </div>
                  </div>

                  {/* Visibility Pills */}
                  <div className="svc-visibility-pills">
                    {Object.entries(service.display).map(([key, val]) => (
                      <button
                        key={key}
                        className={`svc-pill ${val ? "pill-on" : "pill-off"}`}
                        title={`${val ? "Ocultar" : "Mostrar"} ${VISIBILITY_LABELS[key]}`}
                        onClick={() => updateVisibility(service.id, key, !val)}
                      >
                        {val ? <Eye size={11} /> : <EyeOff size={11} />}
                        {key === "name" ? "Nombre" :
                          key === "description" ? "Desc." :
                            key === "gallery" ? "Galería" :
                              key === "duration" ? "Tiempo" : "Precio"}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ==================== EDIT / NEW MODAL ==================== */}
        <Modal
          isOpen={!!editingService}
          onClose={closeEdit}
          title={isNew ? "Nuevo Servicio" : `Editando: ${currentService?.name || ""}`}
          maxWidth="780px"
        >
          {editingService && (
            <div className="svc-edit-modal">

              {/* Row 1: Name + Icon */}
              <div className="svc-form-row">
                <div className="admin-form-group" style={{ flex: 2 }}>
                  <label>NOMBRE DEL SERVICIO</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Lavado Premium"
                  />
                </div>
                {/* Icon Picker */}
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>ÍCONO</label>
                  <button
                    type="button"
                    className="admin-input svc-icon-picker-btn"
                    onClick={() => setShowIconPicker(p => !p)}
                  >
                    {getIcon(form.iconName, { size: 18 })}
                    <span>{form.iconName}</span>
                    <ChevronDown size={14} />
                  </button>
                  <AnimatePresence>
                    {showIconPicker && (
                      <motion.div
                        className="svc-icon-dropdown"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getAvailableIcons().map(iconName => (
                          <button
                            key={iconName}
                            type="button"
                            className={`svc-icon-option ${form.iconName === iconName ? "selected" : ""}`}
                            onClick={() => { setForm(p => ({ ...p, iconName })); setShowIconPicker(false); }}
                          >
                            {getIcon(iconName, { size: 18 })}
                            <span>{iconName}</span>
                            {form.iconName === iconName && <Check size={12} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Row 2: Description */}
              <div className="admin-form-group">
                <label>DESCRIPCIÓN</label>
                <textarea
                  className="admin-input svc-textarea"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe el servicio en detalle..."
                  rows={3}
                />
              </div>

              {/* Row 3: Price + Duration + Featured */}
              <div className="svc-form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>PRECIO ($)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="15000"
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>DURACIÓN</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.duration}
                    onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    placeholder="2h / 2 días"
                  />
                </div>
                <div className="admin-form-group svc-featured-toggle" style={{ flex: 0, minWidth: 120 }}>
                  <label>DESTACADO</label>
                  <button
                    type="button"
                    className={`svc-featured-btn ${form.featured ? "active" : ""}`}
                    onClick={() => setForm(p => ({ ...p, featured: !p.featured }))}
                  >
                    <Star size={16} fill={form.featured ? "currentColor" : "none"} />
                    {form.featured ? "Sí" : "No"}
                  </button>
                </div>
              </div>

              {/* Row 4: Visibility Panel */}
              <div className="svc-visibility-section">
                <button
                  type="button"
                  className="svc-visibility-toggle-btn"
                  onClick={() => setShowVisibility(p => !p)}
                >
                  <Eye size={16} />
                  <span>Ajustes de Visibilidad Pública</span>
                  {showVisibility ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {showVisibility && (
                    <motion.div
                      className="svc-visibility-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="svc-visibility-hint">
                        <Info size={14} />
                        Controlá exactamente qué información ven tus clientes en el sitio público.
                      </p>
                      {Object.entries(VISIBILITY_LABELS).map(([key, label]) => (
                        <ToggleSwitch
                          key={key}
                          label={label}
                          checked={form.display[key]}
                          onChange={val => setDisplayField(key, val)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="svc-modal-actions">
                <button type="button" className="btn-ghost" onClick={closeEdit}>
                  <X size={16} /> Cancelar
                </button>
                <button
                  type="button"
                  className="btn-premium"
                  onClick={handleSave}
                  disabled={!form.name || !form.duration}
                >
                  <Check size={16} />
                  {isNew ? "Crear Servicio" : "Guardar Cambios"}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ==================== GALLERY MODAL ==================== */}
        <Modal
          isOpen={!!editingGallery}
          onClose={closeGallery}
          title={`Galería: ${editingGallery?.name}`}
          maxWidth="1000px"
        >
          {editingGallery && (
            <div className="gallery-manager-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <Carousel images={editingGallery.gallery} />
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className="btn-premium" onClick={addMockImage}>
                    <Camera size={18} /> <span>Añadir Foto</span>
                  </button>
                  <button className="btn-ghost" style={{ border: "1px solid rgba(255,255,255,0.1)" }} onClick={clearGallery}>
                    <Trash2 size={16} /> <span>Limpiar Todo</span>
                  </button>
                </div>
              </div>
              <div className="dashboard-panel gallery-info-panel">
                <h4><Info size={18} style={{ color: "var(--color-primary)" }} /> Info de Gestión</h4>
                <p>
                  Las fotos que subas aquí serán visibles en el carrusel público cuando un cliente haga clic en el servicio.
                  <br /><br />
                  Se recomienda usar imágenes de alta calidad (JPG/PNG) y formato 16:9.
                </p>
                <div className="gallery-stats-box">
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