import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Info,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Carousel from "../../components/ui/Carousel";
import Modal from "../../components/ui/Modal";
import PageTransition from "../../components/ui/PageTransition";
import { useServices } from "../../hooks/useServices";
import { getAvailableIcons, getIcon } from "../../utils/iconMapper";
import { isTwoWheelService } from "../../utils/servicePricing";
import { getServiceCoverUrl } from "../../utils/serviceMedia";
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
  carPrice: "",
  truckPrice: "",
  priceOnRequest: false,
  duration: "",
  iconName: "Zap",
  coverImageUrl: "",
  featured: false,
  display: {
    name: true,
    description: true,
    gallery: true,
    duration: true,
    price: true,
  },
  gallery: [],
};

const VISIBILITY_LABELS = {
  name: "Nombre del servicio",
  description: "Descripcion",
  gallery: "Galeria de trabajos",
  duration: "Duracion estimada",
  price: "Precio",
};

const VISIBILITY_SHORT_LABELS = {
  name: "Nombre",
  description: "Desc.",
  gallery: "Galeria",
  duration: "Tiempo",
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
    services,
    addService,
    updateService,
    deleteService,
    toggleFeatured,
    updateVisibility,
  } = useServices();

  const [editingService, setEditingService] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const formDisplay = { ...emptyForm.display, ...form.display };
  const isNew = editingService === "new";
  const currentService = isNew ? null : services.find((service) => service.id === editingService);
  const usesSinglePrice = isTwoWheelService(form.name);

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value);

  const resetEditState = () => {
    setEditingService(null);
    setForm(emptyForm);
    setShowIconPicker(false);
    setShowVisibility(false);
    setSaveError("");
  };

  const openNew = () => {
    setForm(emptyForm);
    setEditingService("new");
    setShowVisibility(false);
    setShowIconPicker(false);
    setSaveError("");
  };

  const openEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description,
      price: service.price,
      carPrice: service.carPrice,
      truckPrice: service.truckPrice,
      priceOnRequest: service.priceOnRequest,
      duration: service.duration,
      iconName: service.iconName,
      coverImageUrl: service.coverImageUrl || "",
      featured: Boolean(service.featured),
      display: { ...emptyForm.display, ...service.display },
      gallery: [...(service.gallery || [])],
    });
    setEditingService(service.id);
    setShowVisibility(false);
    setShowIconPicker(false);
    setSaveError("");
  };

  const handleSave = async () => {
    if (!form.name || !form.duration) {
      return;
    }

    const payload = {
      ...form,
      display: formDisplay,
      price: Number.parseFloat(form.price) || 0,
      carPrice: Number.parseFloat(form.carPrice) || 0,
      truckPrice: usesSinglePrice ? Number.parseFloat(form.carPrice) || 0 : Number.parseFloat(form.truckPrice) || 0,
    };

    setIsSaving(true);
    setSaveError("");
    try {
      if (editingService === "new") await addService(payload);
      else await updateService(editingService, payload);
      resetEditState();
    } catch (error) {
      console.error(error);
      setSaveError(error?.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const setDisplayField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      display: { ...previous.display, [key]: value },
    }));
  };

  const handleDeleteService = (service) => {
    if (window.confirm(`Eliminar "${service.name}"?`)) {
      deleteService(service.id);
    }
  };

  const openGallery = (service) => setEditingGallery(service);
  const closeGallery = () => setEditingGallery(null);

  const addMockImage = () => {
    if (!editingGallery) {
      return;
    }

    const mockImage = {
      url: "https://images.unsplash.com/photo-1574067332341-35f11e967a5b?q=80&w=1470&auto=format&fit=crop",
      label: "Nueva foto",
    };
    const updatedGallery = [...(editingGallery.gallery || []), mockImage];
    const updatedService = { ...editingGallery, gallery: updatedGallery };

    updateService(editingGallery.id, { gallery: updatedGallery });
    setEditingGallery(updatedService);
  };

  const clearGallery = () => {
    if (!editingGallery) {
      return;
    }

    updateService(editingGallery.id, { gallery: [] });
    setEditingGallery({ ...editingGallery, gallery: [] });
  };

  return (
    <PageTransition>
      <AdminLayout
        title="Gestion de Servicios"
        subtitle="Administra tu catalogo, precios, visibilidad y galerias de fotos."
      >
        <div className="admin-services-container">
          <div className="admin-services-content">
            <AdminPageHeader
              eyebrow="Catalogo"
              icon={<Star size={18} />}
              title="Servicios y precios"
              subtitle="Actualizá lo que ofrecés; los cambios se reflejan también en el sitio público."
              actions={
                <button type="button" className="btn-premium svc-new-btn" onClick={openNew}>
                  <Plus size={20} />
                  <span>Nuevo servicio</span>
                </button>
              }
            />

            <motion.div
              className="admin-services-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {services.map((service) => {
                const displayConfig = { ...emptyForm.display, ...service.display };

                return (
                  <motion.div
                    key={service.id}
                    className={`service-card-pro ${service.featured ? "is-featured" : ""}`}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div className="svc-card-cover"><img src={getServiceCoverUrl(service)} alt={service.name} loading="lazy" /></div>
                    <div className="svc-card-header">
                      <div className="service-icon-wrapper">
                        {getIcon(service.iconName, { size: 20 })}
                      </div>

                      <div className="svc-card-controls">
                        <button
                          type="button"
                          className="btn-icon-sm"
                          title="Cambiar destacados"
                          onClick={() => toggleFeatured(service.id)}
                        >
                          <Star size={14} fill={service.featured ? "currentColor" : "none"} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-sm"
                          title="Gestionar fotos"
                          onClick={() => openGallery(service)}
                        >
                          <ImageIcon size={14} />
                          {service.gallery?.length > 0 && (
                            <span className="svc-dot-indicator" />
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn-icon-sm"
                          title="Editar"
                          onClick={() => openEdit(service)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-danger-sm"
                          title="Eliminar"
                          onClick={() => handleDeleteService(service)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="svc-card-body">
                      {service.featured && <span className="svc-featured-label">Recomendado</span>}
                      <h3 className="svc-title">{service.name}</h3>
                      <p className="svc-desc">{service.description}</p>
                    </div>

                    <div className="svc-card-footer-pro">
                      <div className="svc-meta-group">
                        <Clock size={12} />
                        <span>{service.duration}</span>
                      </div>
                      <div className="svc-price-pro">{service.priceOnRequest ? "Consultar" : isTwoWheelService(service) ? <small>Precio {formatMoney(service.carPrice)}</small> : <><small>Auto {formatMoney(service.carPrice)}</small><small>Camioneta {formatMoney(service.truckPrice)}</small></>}</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        <Modal
          isOpen={Boolean(editingService)}
          onClose={resetEditState}
          title={isNew ? "Nuevo servicio" : `Editando: ${currentService?.name || ""}`}
          maxWidth="780px"
        >
          {editingService ? (
            <div className="svc-edit-modal">
              <div className="svc-form-row">
                <div className="admin-form-group svc-form-group svc-form-group-wide">
                  <label>Nombre del servicio</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                    placeholder="Ej: Lavado Premium"
                  />
                </div>

                <div className="admin-form-group svc-form-group svc-form-group-icon">
                  <label>Icono</label>
                  <button
                    type="button"
                    className="admin-input svc-icon-picker-btn"
                    onClick={() => setShowIconPicker((previous) => !previous)}
                  >
                    {getIcon(form.iconName, { size: 18 })}
                    <span>{form.iconName}</span>
                    <ChevronDown size={14} />
                  </button>

                  <AnimatePresence>
                    {showIconPicker ? (
                      <motion.div
                        className="svc-icon-dropdown"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getAvailableIcons().map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            className={`svc-icon-option ${form.iconName === iconName ? "selected" : ""}`}
                            onClick={() => {
                              setForm((previous) => ({ ...previous, iconName }));
                              setShowIconPicker(false);
                            }}
                          >
                            {getIcon(iconName, { size: 18 })}
                            <span>{iconName}</span>
                            {form.iconName === iconName ? <Check size={12} /> : null}
                          </button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Descripción</label>
                <textarea
                  className="admin-input svc-textarea"
                  value={form.description}
                  onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                  placeholder="Describe el servicio en detalle..."
                  rows={3}
                />
              </div>

              <div className="svc-form-row">
                 <div className="admin-form-group svc-form-group-wide">
                  <label>Imagen de Portada (URL)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.coverImageUrl}
                    onChange={(event) => setForm((previous) => ({ ...previous, coverImageUrl: event.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                {form.coverImageUrl && (
                  <div className="svc-cover-preview">
                    <img src={form.coverImageUrl} alt="Vista previa" />
                  </div>
                )}
              </div>

              <div className="svc-price-mode">
                <label className="svc-consult-toggle">
                  <input type="checkbox" checked={form.priceOnRequest} onChange={(event) => setForm((previous) => ({ ...previous, priceOnRequest: event.target.checked }))} />
                  <span><strong>Precio a consultar</strong><small>Usalo cuando el valor dependa del estado del vehiculo.</small></span>
                </label>
                {!form.priceOnRequest ? <div className={`svc-vehicle-prices ${usesSinglePrice ? "single" : ""}`}>
                  <div className="admin-form-group"><label>{usesSinglePrice ? "Precio del servicio ($)" : "Precio Auto ($)"}</label><input type="number" min="0" className="admin-input" value={form.carPrice} onChange={(event) => setForm((previous) => ({ ...previous, carPrice: event.target.value }))} placeholder="15000" /></div>
                  {!usesSinglePrice ? <div className="admin-form-group"><label>Precio Camioneta ($)</label><input type="number" min="0" className="admin-input" value={form.truckPrice} onChange={(event) => setForm((previous) => ({ ...previous, truckPrice: event.target.value }))} placeholder="20000" /></div> : null}
                </div> : <div className="svc-consult-note">La tarjeta publica mostrara “Consultar” en lugar de un valor fijo.</div>}
              </div>

              <div className="svc-form-row">

                <div className="admin-form-group svc-form-group">
                  <label>Duracion</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.duration}
                    onChange={(event) => setForm((previous) => ({ ...previous, duration: event.target.value }))}
                    placeholder="2h / 2 dias"
                  />
                </div>

                <div className="admin-form-group svc-featured-toggle svc-featured-field">
                  <label>Destacado</label>
                  <button
                    type="button"
                    className={`svc-featured-btn ${form.featured ? "active" : ""}`}
                    onClick={() => setForm((previous) => ({ ...previous, featured: !previous.featured }))}
                  >
                    <Star size={16} fill={form.featured ? "currentColor" : "none"} />
                    {form.featured ? "Si" : "No"}
                  </button>
                </div>
              </div>

              <div className="svc-visibility-section">
                <button
                  type="button"
                  className="svc-visibility-toggle-btn"
                  onClick={() => setShowVisibility((previous) => !previous)}
                >
                  <Eye size={16} />
                  <span>Ajustes de visibilidad publica</span>
                  {showVisibility ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {showVisibility ? (
                    <motion.div
                      className="svc-visibility-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="svc-visibility-hint">
                        <Info size={14} />
                        Controla exactamente que informacion ven tus clientes en el sitio publico.
                      </p>

                      {Object.entries(VISIBILITY_LABELS).map(([key, label]) => (
                        <ToggleSwitch
                          key={key}
                          label={label}
                          checked={formDisplay[key]}
                          onChange={(value) => setDisplayField(key, value)}
                        />
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="svc-modal-actions">
                {saveError ? <p className="svc-save-error" role="alert">{saveError}</p> : null}
                <button type="button" className="btn-ghost" onClick={resetEditState}>
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-premium"
                  onClick={handleSave}
                  disabled={!form.name || !form.duration || isSaving}
                >
                  <Check size={16} />
                  {isSaving ? "Guardando..." : isNew ? "Crear servicio" : "Guardar cambios"}
                </button>
              </div>
            </div>
          ) : null}
        </Modal>

        <Modal
          isOpen={Boolean(editingGallery)}
          onClose={closeGallery}
          title={`Galeria: ${editingGallery?.name}`}
          maxWidth="1000px"
        >
          {editingGallery ? (
            <div className="gallery-manager-grid">
              <div className="gallery-manager-main">
                <Carousel images={editingGallery.gallery || []} />

                <div className="gallery-actions">
                  <button type="button" className="btn-premium" onClick={addMockImage}>
                    <Camera size={18} />
                    <span>Anadir foto</span>
                  </button>

                  <button type="button" className="btn-ghost gallery-clear-btn" onClick={clearGallery}>
                    <Trash2 size={16} />
                    <span>Limpiar todo</span>
                  </button>
                </div>
              </div>

              <div className="dashboard-panel gallery-info-panel">
                <h4>
                  <Info size={18} className="gallery-info-title-icon" />
                  Info de gestion
                </h4>
                <p>
                  Las fotos que subas aqui seran visibles en el carrusel publico cuando un cliente haga clic en el servicio.
                  <br />
                  <br />
                  Se recomienda usar imagenes de alta calidad (JPG/PNG) y formato 16:9.
                </p>
                <div className="gallery-stats-box">
                  <strong>Fotos actuales:</strong> {editingGallery.gallery.length}
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </AdminLayout>
    </PageTransition>
  );
}

export default AdminServices;
