import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
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
  UploadCloud,
  ArrowLeft,
  ArrowRight,
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
import { useFeedback } from "../../hooks/useFeedback";
import { formatMoney } from "../../utils/money";
import ToggleButton from "../../components/ui/ToggleButton";
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
  category: "",
  description: "",
  price: "",
  carPrice: "",
  truckPrice: "",
  priceOnRequest: false,
  duration: "",
  durationMinutes: 120,
  iconName: "Zap",
  coverImageUrl: "",
  active: true,
  publicVisible: true,
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
      <ToggleButton checked={checked} onChange={onChange} className={`svc-toggle ${checked ? "on" : "off"}`}>
        <span className="svc-toggle-knob" />
      </ToggleButton>
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
    togglePublished,
    updateVisibility,
    uploadServiceImage,
    setServiceCover,
    reorderServiceImages,
    deleteServiceImage,
    clearServiceImages,
    isLoading,
    error,
  } = useServices();
  const { confirm, notify } = useFeedback();

  const [editingService, setEditingService] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const galleryInputRef = useRef(null);

  const formDisplay = { ...emptyForm.display, ...form.display };
  const isNew = editingService === "new";
  const currentService = isNew ? null : services.find((service) => service.id === editingService);
  const usesSinglePrice = isTwoWheelService(form.name);

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
      category: service.category || "",
      description: service.description,
      price: service.price,
      carPrice: service.carPrice,
      truckPrice: service.truckPrice,
      priceOnRequest: service.priceOnRequest,
      duration: service.duration,
      durationMinutes: service.durationMinutes,
      iconName: service.iconName,
      coverImageUrl: service.coverImageUrl || "",
      active: service.active !== false,
      publicVisible: service.publicVisible !== false,
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
    if (!form.name.trim() || !form.duration.trim()) {
      notify("Completá el nombre y la duración del servicio.", "error");
      return;
    }

    if ((Number.parseFloat(form.carPrice) || 0) <= 0 || (!usesSinglePrice && (Number.parseFloat(form.truckPrice) || 0) <= 0)) {
      notify("Ingresá los valores internos del servicio para que los turnos y Caja calculen el total.", "error");
      return;
    }

    const payload = {
      ...form,
      display: formDisplay,
      price: Number.parseFloat(form.price) || 0,
      carPrice: Number.parseFloat(form.carPrice) || 0,
      truckPrice: usesSinglePrice ? Number.parseFloat(form.carPrice) || 0 : Number.parseFloat(form.truckPrice) || 0,
      durationMinutes: Math.max(15, Number.parseInt(form.durationMinutes, 10) || 120),
    };

    setIsSaving(true);
    setSaveError("");
    try {
      if (editingService === "new") await addService(payload);
      else await updateService(editingService, payload);
      notify(isNew ? "Servicio creado." : "Cambios del servicio guardados.", "success");
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

  const handleDeleteService = async (service) => {
    if (await confirm({ title: "Eliminar servicio", message: `El servicio "${service.name}" dejara de mostrarse en el catalogo.`, confirmLabel: "Eliminar" })) {
      await deleteService(service.id);
      notify("Servicio eliminado.", "success");
    }
  };

  const openGallery = (service) => setEditingGallery(service);
  const closeGallery = () => setEditingGallery(null);

  const handleGalleryUpload = async (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length || !editingGallery) return;
    setIsUploading(true);
    try {
      let gallery = [...(editingGallery.gallery || [])];
      let coverImageUrl = editingGallery.coverImageUrl;
      for (const file of files.slice(0, 6)) {
        const image = await uploadServiceImage(editingGallery.id, file, { gallery, coverImageUrl });
        gallery = [...gallery, image];
        coverImageUrl ||= image.url;
      }
      setEditingGallery((current) => ({ ...current, gallery, coverImageUrl }));
      notify(`${files.slice(0, 6).length} imagenes cargadas.`, "success");
    } catch (error) { notify(error.message || "No se pudieron cargar las imagenes.", "error"); }
    finally { setIsUploading(false); event.target.value = ""; }
  };

  const handleSetCover = async (image) => {
    await setServiceCover(editingGallery.id, image);
    setEditingGallery((current) => ({ ...current, coverImageUrl: image.url }));
    notify("Portada actualizada.", "success");
  };

  const handleMoveImage = async (index, direction) => {
    const gallery = [...editingGallery.gallery];
    const target = index + direction;
    if (target < 0 || target >= gallery.length) return;
    [gallery[index], gallery[target]] = [gallery[target], gallery[index]];
    await reorderServiceImages(editingGallery.id, gallery);
    setEditingGallery((current) => ({ ...current, gallery }));
  };

  const handleDeleteGalleryImage = async (image) => {
    if (!await confirm({ title: "Eliminar imagen", message: "La imagen se eliminara tambien de Supabase Storage.", confirmLabel: "Eliminar" })) return;
    await deleteServiceImage(editingGallery.id, image);
    const gallery = editingGallery.gallery.filter((item) => item.url !== image.url);
    setEditingGallery((current) => ({ ...current, gallery, coverImageUrl: current.coverImageUrl === image.url ? gallery[0]?.url || "" : current.coverImageUrl }));
    notify("Imagen eliminada.", "success");
  };

  const clearGallery = async () => {
    if (!editingGallery || !await confirm({ title: "Limpiar galeria", message: "Se eliminaran todas las imagenes cargadas para este servicio.", confirmLabel: "Eliminar todas" })) return;
    await clearServiceImages(editingGallery.id);
    setEditingGallery({ ...editingGallery, gallery: [], coverImageUrl: "" });
    notify("Galeria vaciada.", "success");
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

            {error ? <div className="svc-admin-error" role="alert">No pudimos actualizar el catálogo. Revisá la conexión.</div> : null}
            {isLoading ? <div className="svc-admin-loading">Cargando servicios…</div> : null}

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
                    className={`service-card-pro ${service.featured ? "is-featured" : ""} ${service.active && service.publicVisible ? "is-published" : "is-hidden"}`}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div className="svc-card-cover"><img src={getServiceCoverUrl(service)} alt={service.name} loading="lazy" /></div>
                    <span className={`svc-publish-badge ${service.active && service.publicVisible ? "published" : "hidden"}`}>{service.active && service.publicVisible ? <><Eye size={12} /> Publicado</> : <><EyeOff size={12} /> Oculto</>}</span>
                    <div className="svc-card-header">
                      <div className="service-icon-wrapper">
                        {getIcon(service.iconName, { size: 20 })}
                      </div>

                      <div className="svc-card-controls">
                        <button type="button" className="btn-icon-sm" title={service.active && service.publicVisible ? "Ocultar del sitio" : "Publicar en el sitio"} onClick={() => togglePublished(service.id)}>{service.active && service.publicVisible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
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
                      <div className="svc-price-pro">{isTwoWheelService(service) ? <small>Precio interno {formatMoney(service.carPrice)}</small> : <><small>Auto {formatMoney(service.carPrice)}</small><small>Camioneta {formatMoney(service.truckPrice)}</small></>}</div>
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

              <div className="svc-price-mode">
                <label className="svc-consult-toggle">
                  <input type="checkbox" checked={formDisplay.price && !form.priceOnRequest} onChange={(event) => {
                    const publishPrice = event.target.checked;
                    setForm((previous) => ({ ...previous, priceOnRequest: !publishPrice, display: { ...previous.display, price: publishPrice } }));
                  }} />
                  <span><strong>Publicar precios en el sitio</strong><small>Si lo desactivás, el público verá “Consultar precio”; los valores internos seguirán activos para turnos y Caja.</small></span>
                </label>
                <div className={`svc-vehicle-prices ${usesSinglePrice ? "single" : ""}`}>
                  <div className="admin-form-group"><label>{usesSinglePrice ? "Precio del servicio ($)" : "Precio Auto ($)"}</label><input type="number" min="0" className="admin-input" value={form.carPrice} onChange={(event) => setForm((previous) => ({ ...previous, carPrice: event.target.value }))} placeholder="15000" /></div>
                  {!usesSinglePrice ? <div className="admin-form-group"><label>Precio Camioneta ($)</label><input type="number" min="0" className="admin-input" value={form.truckPrice} onChange={(event) => setForm((previous) => ({ ...previous, truckPrice: event.target.value }))} placeholder="20000" /></div> : null}
                </div>
                <div className="svc-consult-note">Estos valores se usan siempre dentro del panel al agendar, aunque no los publiques.</div>
              </div>

              <div className="admin-form-group">
                <label>Categoría</label>
                <input type="text" className="admin-input" value={form.category} onChange={(event) => setForm((previous) => ({ ...previous, category: event.target.value }))} placeholder="Ej: Lavado, Interior o Protección" />
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

                <div className="admin-form-group svc-form-group">
                  <label>Minutos para la agenda</label>
                  <input type="number" min="15" step="15" className="admin-input" value={form.durationMinutes} onChange={(event) => setForm((previous) => ({ ...previous, durationMinutes: event.target.value }))} placeholder="120" />
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

                <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleGalleryUpload} />
                <button type="button" className="svc-upload-zone" onClick={() => galleryInputRef.current?.click()} disabled={isUploading}>
                  <UploadCloud size={22} /><span><strong>{isUploading ? "Comprimiendo y subiendo..." : "Agregar imagenes"}</strong><small>JPG, PNG o WebP. Se optimizan automaticamente.</small></span>
                </button>

                {editingGallery.gallery?.length ? <div className="svc-gallery-list">{editingGallery.gallery.map((image, index) => <article className={`svc-gallery-item ${editingGallery.coverImageUrl === image.url ? "is-cover" : ""}`} key={image.url}>
                  <img src={image.url} alt={image.label || `${editingGallery.name} ${index + 1}`} />
                  <div><strong>{editingGallery.coverImageUrl === image.url ? "Portada" : `Imagen ${index + 1}`}</strong><span>{image.label || editingGallery.name}</span></div>
                  <div className="svc-gallery-item-actions"><button type="button" onClick={() => handleMoveImage(index, -1)} disabled={index === 0} title="Mover a la izquierda"><ArrowLeft size={14} /></button><button type="button" onClick={() => handleMoveImage(index, 1)} disabled={index === editingGallery.gallery.length - 1} title="Mover a la derecha"><ArrowRight size={14} /></button>{editingGallery.coverImageUrl !== image.url ? <button type="button" onClick={() => handleSetCover(image)} title="Usar como portada"><ImageIcon size={14} /></button> : null}<button type="button" className="danger" onClick={() => handleDeleteGalleryImage(image)} title="Eliminar"><Trash2 size={14} /></button></div>
                </article>)}</div> : <p className="svc-gallery-empty">Todavia no cargaste fotos propias. La tarjeta usa la imagen predeterminada del proyecto.</p>}

                <div className="gallery-actions">
                  <button type="button" className="btn-ghost gallery-clear-btn" onClick={clearGallery} disabled={!editingGallery.gallery?.length || isUploading}>
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
                  <strong>Fotos actuales:</strong> {editingGallery.gallery?.length || 0}
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
