import { useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import { Plus, X, UploadCloud, Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { useGallery } from "../../hooks/useGallery";
import "./Gallery.css";

function AdminGallery() {
  const { images, addImage, deleteImage, toggleStatus } = useGallery();
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // References for native file inputs
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  // Convert File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // over 2MB safeguard
       alert("La imagen es demasiado pesada. Considerá subir una menor a 2MB para evitar llenar la memoria del navegador.");
       return;
    }

    try {
      setIsProcessing(true);
      const base64 = await fileToBase64(file);
      if (type === "before") setBeforeImage(base64);
      if (type === "after") setAfterImage(base64);
    } catch (err) {
      console.error(err);
      alert("Error al procesar la imagen.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !service || !afterImage) {
      alert("El título, el servicio y al menos la foto de 'Después' son obligatorios.");
      return;
    }

    addImage({
      title,
      service,
      beforeUrl: beforeImage, // Can be null if only "after" is provided
      afterUrl: afterImage,
    });

    // Reset Form
    setTitle("");
    setService("");
    setBeforeImage(null);
    setAfterImage(null);
    setShowForm(false);
  };

  return (
    <PageTransition>
      <AdminLayout
        title="Galería de Trabajos"
        subtitle="Administrá las fotos del Antes y Después que se muestran en tu página web."
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ImageIcon size={20} className="text-secondary" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Fotos y Evidencia</h2>
          </div>
          <button 
            className={showForm ? "btn-ghost" : "btn-premium"} 
            onClick={() => setShowForm(!showForm)} 
            style={{ minWidth: "220px", justifyContent: "center" }}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "Cancelar Subida" : "Subir Nuevo Trabajo"}
          </button>
        </div>

        {showForm && (
          <div className="inquiry-form-container" style={{ marginBottom: "3rem", padding: "2.5rem", minHeight: "auto", animation: "slideDown 0.4s ease-out" }}>
            <h3 style={{ marginBottom: "2rem", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-primary)" }}>
              Añadir al Portfolio
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
                <div className="inquiry-form-group">
                  <label>Título del Trabajo (Requerido)</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Tratamiento Acrílico Toyota" />
                </div>
                <div className="inquiry-form-group">
                  <label>Categoría / Servicio (Requerido)</label>
                  <input type="text" required value={service} onChange={e => setService(e.target.value)} placeholder="Ej: Pulido" />
                </div>
              </div>

              <div className="gallery-uploader-grid">
                {/* BEFORE UPLOAD */}
                <div className="gallery-uploader-box">
                  <span className="uploader-label">Foto del ANTES (Opcional)</span>
                  {beforeImage ? (
                    <div className="uploader-preview">
                      <img src={beforeImage} alt="Antes" />
                      <button type="button" className="btn-remove-img" onClick={() => setBeforeImage(null)}><Trash2 size={16}/></button>
                    </div>
                  ) : (
                    <div className="uploader-placeholder" onClick={() => beforeInputRef.current?.click()}>
                      <UploadCloud size={32} />
                      <p>Hacé clic para cargar la foto</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={beforeInputRef} style={{ display: 'none' }} onChange={(e) => handleImageChange(e, "before")} />
                </div>

                {/* AFTER UPLOAD */}
                <div className="gallery-uploader-box">
                  <span className="uploader-label" style={{ color: "var(--color-primary)" }}>Foto del DESPUÉS (Requerido)</span>
                  {afterImage ? (
                    <div className="uploader-preview">
                      <img src={afterImage} alt="Después" />
                      <button type="button" className="btn-remove-img" onClick={() => setAfterImage(null)}><Trash2 size={16}/></button>
                    </div>
                  ) : (
                    <div className="uploader-placeholder premium-dropzone" onClick={() => afterInputRef.current?.click()}>
                      <UploadCloud size={32} />
                      <p>Hacé clic para cargar la foto final</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={afterInputRef} style={{ display: 'none' }} onChange={(e) => handleImageChange(e, "after")} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
                <button type="submit" disabled={isProcessing} className="btn-form-primary" style={{ minWidth: "200px" }}>
                  {isProcessing ? "Procesando..." : "Guardar en Galería"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="gallery-grid">
          {images.map((img) => (
            <div key={img.id} className={`gallery-admin-card ${img.status === "draft" ? "is-draft" : ""}`}>
              <div className="gallery-card-images">
                {img.beforeUrl && (
                  <div className="img-wrapper before-col">
                    <span className="img-badge">ANTES</span>
                    <img src={img.beforeUrl} alt="Antes" loading="lazy"/>
                  </div>
                )}
                <div className="img-wrapper after-col" style={{ gridColumn: img.beforeUrl ? 'span 1' : 'span 2' }}>
                  <span className="img-badge success">DESPUÉS</span>
                  <img src={img.afterUrl} alt="Después" loading="lazy"/>
                </div>
              </div>
              
              <div className="gallery-card-info">
                <div>
                  <h4 className="gallery-card-title">{img.title}</h4>
                  <p className="gallery-card-service">{img.service}</p>
                </div>
                
                <div className="gallery-card-actions">
                  <button 
                    className={`btn-action-sm ${img.status === "published" ? "btn-success" : "btn-warning"}`}
                    onClick={() => toggleStatus(img.id)}
                    title={img.status === "published" ? "Ocultar de la web" : "Publicar en la web"}
                  >
                    {img.status === "published" ? <Eye size={16} /> : <EyeOff size={16} />}
                    {img.status === "published" ? "Público" : "Oculto"}
                  </button>
                  <button className="btn-action-sm btn-danger" onClick={() => {
                    if(window.confirm("¿Estás seguro de eliminar esta foto?")) deleteImage(img.id);
                  }} title="Eliminar definitivamente">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {images.length === 0 && !showForm && (
            <div style={{ gridColumn: "1 / -1", padding: "6rem", textAlign: "center", color: "var(--color-text-soft)", fontStyle: "italic", background: "rgba(255,255,255,0.02)", borderRadius: "20px" }}>
              Aún no has subido imágenes a tu portafolio.
            </div>
          )}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default AdminGallery;
