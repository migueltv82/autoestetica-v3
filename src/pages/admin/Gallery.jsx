import { useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { Plus, X, UploadCloud, Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { useGallery } from "../../hooks/useGallery";
import "./Gallery.css";

function AdminGallery() {
  const { images, addImage, deleteImage, toggleStatus } = useGallery();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es demasiado pesada. Usa una menor a 2MB para no llenar la memoria del navegador.");
      return;
    }

    try {
      setIsProcessing(true);
      const base64 = await fileToBase64(file);
      if (type === "before") setBeforeImage(base64);
      if (type === "after") setAfterImage(base64);
    } catch (error) {
      console.error(error);
      alert("Error al procesar la imagen.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title || !service || !afterImage) {
      alert("El titulo, el servicio y al menos la foto final son obligatorios.");
      return;
    }

    addImage({
      title,
      service,
      beforeUrl: beforeImage,
      afterUrl: afterImage,
    });

    setTitle("");
    setService("");
    setBeforeImage(null);
    setAfterImage(null);
    setShowForm(false);
  };

  return (
    <PageTransition>
      <AdminLayout
        title="Galeria de Trabajos"
        subtitle="Administra el portfolio antes y despues con control de visibilidad."
      >
        <AdminPageHeader
          eyebrow="Portfolio"
          icon={<ImageIcon size={18} />}
          title="Galería de trabajos"
          subtitle="Subí resultados y elegí cuáles querés mostrar en el sitio."
          actions={
            <button className={showForm ? "btn-ghost" : "btn-premium"} onClick={() => setShowForm((current) => !current)}>
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? "Cancelar subida" : "Subir nuevo trabajo"}</span>
            </button>
          }
        />

        {showForm ? (
          <section className="admin-form-shell">
            <div className="admin-form-header">
              <div>
                <span className="admin-form-kicker">Portfolio</span>
                <h3 className="admin-form-title">Agregar caso a la galeria</h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="gallery-form-grid">
              <div className="admin-form-grid wide">
                <div className="admin-form-group">
                  <label>Titulo del trabajo</label>
                  <input type="text" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Tratamiento acrilico Toyota" />
                </div>
                <div className="admin-form-group">
                  <label>Categoria / servicio</label>
                  <input type="text" required value={service} onChange={(event) => setService(event.target.value)} placeholder="Ej: Pulido" />
                </div>
              </div>

              <div className="gallery-uploader-grid">
                <div className="gallery-uploader-box">
                  <span className="uploader-label">Foto del antes</span>
                  {beforeImage ? (
                    <div className="uploader-preview">
                      <img src={beforeImage} alt="Antes" />
                      <button type="button" className="btn-remove-img" onClick={() => setBeforeImage(null)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="uploader-placeholder" onClick={() => beforeInputRef.current?.click()}>
                      <UploadCloud size={32} />
                      <p>Haz clic para cargar la foto inicial</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={beforeInputRef} style={{ display: "none" }} onChange={(event) => handleImageChange(event, "before")} />
                </div>

                <div className="gallery-uploader-box">
                  <span className="uploader-label uploader-label-primary">Foto del despues</span>
                  {afterImage ? (
                    <div className="uploader-preview">
                      <img src={afterImage} alt="Despues" />
                      <button type="button" className="btn-remove-img" onClick={() => setAfterImage(null)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="uploader-placeholder premium-dropzone" onClick={() => afterInputRef.current?.click()}>
                      <UploadCloud size={32} />
                      <p>Haz clic para cargar la foto final</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={afterInputRef} style={{ display: "none" }} onChange={(event) => handleImageChange(event, "after")} />
                </div>
              </div>

              <div className="admin-form-actions">
                <button type="submit" disabled={isProcessing} className="btn-form-primary">
                  {isProcessing ? "Procesando..." : "Guardar en galeria"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <div className="gallery-grid">
          {images.map((image) => (
            <div key={image.id} className={`gallery-admin-card ${image.status === "draft" ? "is-draft" : ""}`}>
              <div className="gallery-card-images">
                {image.beforeUrl ? (
                  <div className="img-wrapper before-col">
                    <span className="img-badge">ANTES</span>
                    <img src={image.beforeUrl} alt="Antes" loading="lazy" />
                  </div>
                ) : null}
                <div className="img-wrapper after-col" style={{ gridColumn: image.beforeUrl ? "span 1" : "span 2" }}>
                  <span className="img-badge success">DESPUES</span>
                  <img src={image.afterUrl} alt="Despues" loading="lazy" />
                </div>
              </div>

              <div className="gallery-card-info">
                <div>
                  <h4 className="gallery-card-title">{image.title}</h4>
                  <p className="gallery-card-service">{image.service}</p>
                </div>

                <div className="gallery-card-actions">
                  <button
                    className={`btn-action-sm ${image.status === "published" ? "btn-success" : "btn-warning"}`}
                    onClick={() => toggleStatus(image.id)}
                    title={image.status === "published" ? "Ocultar de la web" : "Publicar en la web"}
                  >
                    {image.status === "published" ? <Eye size={16} /> : <EyeOff size={16} />}
                    {image.status === "published" ? "Publico" : "Oculto"}
                  </button>
                  <button
                    className="btn-action-sm btn-danger"
                    onClick={() => {
                      if (window.confirm("Estas seguro de eliminar esta foto?")) deleteImage(image.id);
                    }}
                    title="Eliminar definitivamente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {images.length === 0 && !showForm ? (
            <div className="admin-empty-state gallery-empty-state">
              <ImageIcon size={48} />
              <p>Aun no has subido imagenes al portfolio.</p>
            </div>
          ) : null}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default AdminGallery;
