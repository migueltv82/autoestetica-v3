import { useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { Plus, X, UploadCloud, Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { useGallery } from "../../hooks/useGallery";
import { useFeedback } from "../../hooks/useFeedback";
import { compressImageFile } from "../../utils/imageUpload";
import { useServices } from "../../hooks/useServices";
import "./Gallery.css";

function AdminGallery() {
  const { images, isLoading, error, addImage, deleteImage, toggleStatus } = useGallery();
  const { services } = useServices();
  const { confirm, notify } = useFeedback();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [publicationConsent, setPublicationConsent] = useState(false);
  const [publishNow, setPublishNow] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      notify("La imagen supera los 20 MB. Elegi una imagen mas liviana.", "error");
      return;
    }

    try {
      setIsProcessing(true);
      const compressed = await compressImageFile(file, { maxWidth: 1800, maxHeight: 1350, quality: 0.84 });
      const base64 = await blobToBase64(compressed);
      if (type === "before") setBeforeImage(base64);
      if (type === "after") setAfterImage(base64);
    } catch (error) {
      console.error(error);
      notify("No se pudo procesar la imagen.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !service || !afterImage) {
      notify("Completa el titulo, el servicio y la foto final.", "error");
      return;
    }

    setIsProcessing(true);
    try {
      await addImage({ title, service, beforeUrl: beforeImage, afterUrl: afterImage, publicationConsent, publishNow });
      setTitle(""); setService(""); setBeforeImage(null); setAfterImage(null); setPublicationConsent(false); setPublishNow(true); setShowForm(false);
      notify("Trabajo agregado a la galería.", "success");
    } catch (uploadError) { notify(uploadError.message || "No se pudo guardar el trabajo.", "error"); }
    finally { setIsProcessing(false); }
  };

  const handleDeleteImage = async (id) => {
    const accepted = await confirm({ title: "Eliminar trabajo", message: "La publicacion dejara de aparecer en la galeria.", confirmLabel: "Eliminar" });
    if (!accepted) return;
    try { await deleteImage(id); notify("Publicación eliminada.", "success"); }
    catch (deleteError) { notify(deleteError.message || "No se pudo eliminar la publicación.", "error"); }
  };

  const handleToggleStatus = async (id) => {
    try { await toggleStatus(id); notify("Visibilidad actualizada.", "success"); }
    catch (statusError) { notify(statusError.message || "No se pudo cambiar la visibilidad.", "error"); }
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
                  <select required value={service} onChange={(event) => setService(event.target.value)}><option value="">Seleccionar servicio</option>{services.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
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
                    <button type="button" className="uploader-placeholder" onClick={() => beforeInputRef.current?.click()}>
                      <UploadCloud size={32} />
                      <p>Cargar foto inicial <small>Opcional</small></p>
                    </button>
                  )}
                  <input type="file" accept="image/*" ref={beforeInputRef} className="gallery-file-input" onChange={(event) => handleImageChange(event, "before")} />
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
                    <button type="button" className="uploader-placeholder premium-dropzone" onClick={() => afterInputRef.current?.click()}>
                      <UploadCloud size={32} />
                      <p>Cargar foto final <small>Obligatoria</small></p>
                    </button>
                  )}
                  <input type="file" accept="image/*" ref={afterInputRef} className="gallery-file-input" onChange={(event) => handleImageChange(event, "after")} />
                </div>
              </div>

              <div className="gallery-publication-options"><label><input type="checkbox" checked={publicationConsent} onChange={(event) => setPublicationConsent(event.target.checked)} /><span><strong>Autorización del cliente</strong><small>Confirmo que el cliente autorizó usar estas imágenes en el sitio.</small></span></label><label><input type="checkbox" checked={publishNow} onChange={(event) => setPublishNow(event.target.checked)} disabled={!publicationConsent} /><span><strong>Publicar ahora</strong><small>Si está desactivado, el trabajo se guarda como borrador.</small></span></label></div>

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
                <div className={`img-wrapper after-col ${image.beforeUrl ? "" : "single"}`}>
                  <span className="img-badge success">DESPUES</span>
                  <img src={image.afterUrl} alt="Despues" loading="lazy" />
                </div>
              </div>

              <div className="gallery-card-info">
                <div>
                  <h4 className="gallery-card-title">{image.title}</h4>
                  <p className="gallery-card-service">{image.service}</p>
                  {!image.publicationConsent ? <span className="gallery-consent-warning">Sin autorización para publicar</span> : null}
                </div>

                <div className="gallery-card-actions">
                  <button
                    className={`btn-action-sm ${image.status === "published" ? "btn-success" : "btn-warning"}`}
                    onClick={() => handleToggleStatus(image.id)}
                    title={image.status === "published" ? "Ocultar de la web" : "Publicar en la web"}
                  >
                    {image.status === "published" ? <Eye size={16} /> : <EyeOff size={16} />}
                    {image.status === "published" ? "Publico" : "Oculto"}
                  </button>
                  <button
                    className="btn-action-sm btn-danger"
                    onClick={() => {
                      handleDeleteImage(image.id);
                    }}
                    title="Eliminar definitivamente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isLoading ? <div className="admin-empty-state gallery-empty-state"><p>Cargando trabajos…</p></div> : null}
          {error ? <div className="gallery-admin-error gallery-empty-state" role="alert">No pudimos actualizar la galería.</div> : null}
          {!isLoading && images.length === 0 && !showForm ? (
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
