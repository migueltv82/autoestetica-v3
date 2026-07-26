import { useMemo, useRef, useState } from "react";
import {
  Check,
  Clock3,
  Image,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ReceiptText,
  RefreshCw,
  Save,
  ShieldCheck,
  Store,
  Trash2,
  UploadCloud,
  UserPlus,
  Users,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import Loader from "../../components/ui/Loader";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "../../components/ui/SocialIcons";
import { useAuth } from "../../hooks/useAuth";
import { useFeedback } from "../../hooks/useFeedback";
import { useSettings } from "../../hooks/useSettings";
import { useTeamMembers } from "../../hooks/useTeamMembers";
import { compressImageFile } from "../../utils/imageUpload";
import "./Settings.css";

const ROLE_LABELS = {
  owner: "Owner",
  admin: "Administrador",
  employee: "Empleado",
};

const roleOptionsFor = (currentRole) => currentRole === "owner" ? ["owner", "admin", "employee"] : ["employee"];

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : "Sin ingreso";
}

function SettingsSection({ icon, title, text, badge, children }) {
  return (
    <section className="settings-section">
      <header>
        <span className="settings-section-icon">{icon}</span>
        <div>
          <div className="settings-title-line">
            <h2>{title}</h2>
            {badge ? <small>{badge}</small> : null}
          </div>
          <p>{text}</p>
        </div>
      </header>
      <div className="settings-fields">{children}</div>
    </section>
  );
}

function Field({ label, hint, children, full = false }) {
  return (
    <div className={`settings-field${full ? " full" : ""}`}>
      <label>{label}</label>
      {children}
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function TransformationImagePicker({ label, hint, imageUrl, inputRef, onPick, onRemove, isProcessing }) {
  return (
    <div className="settings-transform-uploader">
      <span>{label}</span>
      {imageUrl ? (
        <div className="settings-transform-preview">
          <img src={imageUrl} alt={label} />
          <button type="button" onClick={onRemove} disabled={isProcessing} aria-label={`Quitar ${label}`}>
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <button type="button" className="settings-transform-placeholder" onClick={() => inputRef.current?.click()} disabled={isProcessing}>
          <UploadCloud size={28} />
          <strong>Cargar imagen</strong>
          <small>{hint}</small>
        </button>
      )}
      <input type="file" accept="image/*" ref={inputRef} className="settings-file-input" onChange={onPick} />
    </div>
  );
}

function SettingsForm({ initialSettings, onSave }) {
  const [form, setForm] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState("");
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);
  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialSettings), [form, initialSettings]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function handleTransformationImage(event, target) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("La imagen supera los 20 MB. Elegí una imagen más liviana.");
      return;
    }

    setIsProcessingImage(true);
    setError("");
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1800, maxHeight: 1350, quality: 0.86 });
      const dataUrl = await blobToDataUrl(compressed);
      setForm((current) => ({
        ...current,
        [target === "before" ? "transformationBeforeUrl" : "transformationAfterUrl"]: dataUrl,
      }));
    } catch (imageError) {
      console.error(imageError);
      setError(imageError.message || "No se pudo procesar la imagen.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  function removeTransformationImage(target) {
    setForm((current) => ({
      ...current,
      [target === "before" ? "transformationBeforeUrl" : "transformationAfterUrl"]: "",
      [target === "before" ? "transformationBeforePath" : "transformationAfterPath"]: "",
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.businessName.trim() || !form.whatsapp.trim()) {
      setError("El nombre del negocio y WhatsApp son obligatorios.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const savedSettings = await onSave(form);
      if (savedSettings) setForm(savedSettings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (saveError) {
      setError(saveError.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="settings-form">
      <div className="settings-layout">
        <div className="settings-main">
          <SettingsSection icon={<Store size={20} />} title="Identidad del negocio" text="Nombre, ubicación y horarios que ven tus clientes." badge="Sitio y footer">
            <Field label="Nombre del negocio">
              <input name="businessName" value={form.businessName} onChange={change} required />
            </Field>
            <Field label="Dirección">
              <div className="settings-input-icon"><MapPin size={15} /><input name="address" value={form.address} onChange={change} placeholder="Tucumán, Argentina" /></div>
            </Field>
            <Field label="Horarios" full>
              <div className="settings-input-icon"><Clock3 size={15} /><input name="openingHours" value={form.openingHours} onChange={change} placeholder="Lunes a viernes de 9:00 a 18:00" /></div>
            </Field>
            <Field label="URL del logo" hint="Se usa en el encabezado, footer y recibos." full>
              <div className="settings-input-icon"><Image size={15} /><input type="url" name="logoUrl" value={form.logoUrl} onChange={change} placeholder="https://…" /></div>
            </Field>
          </SettingsSection>

          <SettingsSection icon={<Image size={20} />} title="Deslizá y descubrí" text="Controlá el antes y después principal que aparece en la página de inicio." badge="Inicio">
            <Field label="Título" full>
              <input name="transformationTitle" value={form.transformationTitle} onChange={change} placeholder="Deslizá y descubrí la diferencia" />
            </Field>
            <Field label="Texto de apoyo" full>
              <textarea name="transformationSubtitle" rows="3" value={form.transformationSubtitle} onChange={change} placeholder="Explicá brevemente qué muestra esta comparación." />
            </Field>
            <Field label="Etiqueta del resultado" hint="Aparece debajo de la imagen. Ej: Lavado premium, Interior recuperado, Abrillantado." full>
              <input name="transformationServiceLabel" value={form.transformationServiceLabel} onChange={change} placeholder="Resultado real de detailing" />
            </Field>
            <div className="settings-transform-grid">
              <TransformationImagePicker
                label="Foto del antes"
                hint="Ideal: mismo encuadre que el después."
                imageUrl={form.transformationBeforeUrl}
                inputRef={beforeInputRef}
                onPick={(event) => handleTransformationImage(event, "before")}
                onRemove={() => removeTransformationImage("before")}
                isProcessing={isProcessingImage || isSaving}
              />
              <TransformationImagePicker
                label="Foto del después"
                hint="Mostrá el resultado final limpio y atractivo."
                imageUrl={form.transformationAfterUrl}
                inputRef={afterInputRef}
                onPick={(event) => handleTransformationImage(event, "after")}
                onRemove={() => removeTransformationImage("after")}
                isProcessing={isProcessingImage || isSaving}
              />
            </div>
            <p className="settings-transform-helper">
              Si no cargás ambas imágenes, el inicio usará una comparación publicada de Galería o una imagen de respaldo.
            </p>
          </SettingsSection>

          <SettingsSection icon={<Phone size={20} />} title="Contacto y redes" text="Dejá vacío cualquier canal que no quieras mostrar." badge="Sitio público">
            <Field label="WhatsApp">
              <div className="settings-input-icon"><MessageCircle size={15} /><input type="tel" inputMode="tel" name="whatsapp" value={form.whatsapp} onChange={change} required placeholder="+54 9 381…" /></div>
            </Field>
            <Field label="Teléfono público">
              <div className="settings-input-icon"><Phone size={15} /><input type="tel" inputMode="tel" name="phone" value={form.phone} onChange={change} /></div>
            </Field>
            <Field label="Email" full>
              <div className="settings-input-icon"><Mail size={15} /><input type="email" name="email" value={form.email} onChange={change} /></div>
            </Field>
            <Field label="Instagram">
              <div className="settings-input-icon"><InstagramIcon size={15} /><input type="url" name="instagram" value={form.instagram} onChange={change} placeholder="https://instagram.com/…" /></div>
            </Field>
            <Field label="Facebook">
              <div className="settings-input-icon"><FacebookIcon size={15} /><input type="url" name="facebook" value={form.facebook} onChange={change} placeholder="https://facebook.com/…" /></div>
            </Field>
            <Field label="TikTok" full>
              <div className="settings-input-icon"><TikTokIcon size={15} /><input type="url" name="tiktok" value={form.tiktok} onChange={change} placeholder="https://tiktok.com/@…" /></div>
            </Field>
          </SettingsSection>

          <SettingsSection icon={<MessageCircle size={20} />} title="Mensajes de WhatsApp" text="Plantillas usadas desde la Agenda y la ficha de clientes." badge="WhatsApp">
            <Field label="Confirmación de turno" hint="Variables: {cliente}, {negocio}, {fecha}, {hora}, {vehiculo} y {servicios}." full>
              <textarea name="confirmationMessageTemplate" rows="5" value={form.confirmationMessageTemplate} onChange={change} />
            </Field>
            <Field label="Aviso de vehículo listo" hint="Variables disponibles: {cliente}, {vehiculo} y {horario}." full>
              <textarea name="readyMessageTemplate" rows="5" value={form.readyMessageTemplate} onChange={change} />
            </Field>
          </SettingsSection>

          <SettingsSection icon={<ReceiptText size={20} />} title="Recibos" text="Texto final que acompaña cada comprobante generado." badge="Caja">
            <Field label="Pie del recibo" full>
              <textarea name="receiptFooter" rows="3" value={form.receiptFooter} onChange={change} placeholder="Gracias por confiar en nuestro trabajo." />
            </Field>
          </SettingsSection>
        </div>
      </div>

      <div className="settings-save-bar">
        <div>{error ? <span className="settings-error">{error}</span> : isProcessingImage ? <span>Procesando imagen…</span> : isDirty ? <span>Tenés cambios sin guardar.</span> : <span>La configuración está actualizada.</span>}</div>
        <button type="submit" className={`btn-premium settings-save-btn ${isSaved ? "success" : ""}`} disabled={isSaving || isProcessingImage || !isDirty}>
          {isSaved ? <Check size={18} /> : <Save size={18} />}
          <span>{isSaving ? "Guardando…" : isSaved ? "Cambios guardados" : "Guardar cambios"}</span>
        </button>
      </div>
    </form>
  );
}

function TeamMemberRow({ member, currentUserId, currentRole, onUpdate, onDelete }) {
  const [draft, setDraft] = useState(() => ({
    id: member.id,
    fullName: member.fullName,
    role: member.role,
    active: member.active,
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const isSelf = member.id === currentUserId;
  const canManageRoleStatus = !isSelf && (currentRole === "owner" || member.role === "employee");
  const canEditName = isSelf || currentRole === "owner" || member.role === "employee";
  const isDirty = draft.fullName !== member.fullName || draft.role !== member.role || draft.active !== member.active;

  async function save(nextDraft = draft) {
    setIsSaving(true);
    setError("");
    try {
      await onUpdate(nextDraft);
      setDraft(nextDraft);
    } catch (updateError) {
      setError(updateError.message || "No se pudo actualizar el usuario.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive() {
    const nextDraft = { ...draft, active: !draft.active };
    await save(nextDraft);
  }

  async function removeMember() {
    setIsDeleting(true);
    setError("");
    try {
      await onDelete(member);
    } catch (deleteError) {
      setError(deleteError.message || "No se pudo eliminar el usuario.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className={`team-row ${draft.active ? "" : "inactive"}`}>
      <div className="team-user-main">
        <div className="team-avatar">{(draft.fullName || member.email).slice(0, 1).toUpperCase()}</div>
        <div>
          <input value={draft.fullName} onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))} placeholder="Nombre del usuario" disabled={!canEditName || isSaving} />
          <small>{member.email}{isSelf ? " · sos vos" : ""}</small>
        </div>
      </div>

      <div className="team-user-meta">
        <span>Creado: {formatDate(member.createdAt)}</span>
        <span>Último ingreso: {formatDate(member.lastSignInAt)}</span>
      </div>

      <div className="team-user-actions">
        <select value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} disabled={!canManageRoleStatus || isSaving}>
          {roleOptionsFor(currentRole).map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
        </select>
        <button type="button" className={draft.active ? "team-status active" : "team-status"} onClick={toggleActive} disabled={!canManageRoleStatus || isSaving || isDeleting}>
          {draft.active ? "Bloquear" : "Desbloquear"}
        </button>
        <button type="button" className="team-save-small" onClick={() => save()} disabled={!canEditName || !isDirty || isSaving || isDeleting}>
          {isSaving ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className="team-delete-small" onClick={removeMember} disabled={!canManageRoleStatus || isSaving || isDeleting}>
          <Trash2 size={14} /> {isDeleting ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
      {error ? <p className="team-row-error" role="alert">{error}</p> : null}
    </article>
  );
}

function TeamSettings() {
  const { user, profile } = useAuth();
  const { confirm } = useFeedback();
  const { members, isLoading, error, addMember, updateMember, deleteMember } = useTeamMembers();
  const [newMember, setNewMember] = useState({ email: "", fullName: "", role: "employee", temporaryPassword: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  async function submitNewMember(event) {
    event.preventDefault();
    setMessage("");
    if (!newMember.email.trim()) {
      setMessage("Ingresá el email del usuario.");
      return;
    }
    if (newMember.temporaryPassword && newMember.temporaryPassword.length < 8) {
      setMessage("La clave temporal debe tener al menos 8 caracteres.");
      return;
    }

    setIsAdding(true);
    try {
      const result = await addMember(newMember);
      setNewMember({ email: "", fullName: "", role: "employee", temporaryPassword: "" });
      setMessage(result?.message || "Usuario creado/invitado y agregado al equipo.");
    } catch (addError) {
      setMessage(addError.message || "No se pudo agregar el usuario.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteMember(member) {
    const accepted = await confirm({
      title: "Eliminar usuario del equipo",
      message: `Se quitará el acceso de ${member.fullName || member.email}. Si no tiene historial, también se eliminará de Supabase Auth. Si tiene trabajos o caja asociados, se conservará internamente bloqueado para no romper registros.`,
      confirmLabel: "Eliminar usuario",
    });
    if (!accepted) return;
    const result = await deleteMember(member.id);
    setMessage(result?.message || "Usuario eliminado del equipo.");
  }

  return (
    <section className="settings-section team-section">
      <header>
        <span className="settings-section-icon"><Users size={20} /></span>
        <div>
          <div className="settings-title-line"><h2>Equipo y permisos</h2><small>Seguridad</small></div>
          <p>Administrá quién puede entrar al panel y qué nivel de acceso tiene.</p>
        </div>
      </header>

      <form className="team-add-form" onSubmit={submitNewMember}>
        <div>
          <label>Email del usuario</label>
          <input type="email" value={newMember.email} onChange={(event) => setNewMember((current) => ({ ...current, email: event.target.value }))} placeholder="usuario@email.com" />
        </div>
        <div>
          <label>Nombre</label>
          <input value={newMember.fullName} onChange={(event) => setNewMember((current) => ({ ...current, fullName: event.target.value }))} placeholder="Nombre visible" />
        </div>
        <div>
          <label>Rol</label>
          <select value={newMember.role} onChange={(event) => setNewMember((current) => ({ ...current, role: event.target.value }))}>
            <option value="employee">Empleado</option>
            {profile?.role === "owner" ? <option value="admin">Administrador</option> : null}
            {profile?.role === "owner" ? <option value="owner">Owner</option> : null}
          </select>
        </div>
        <div>
          <label>Clave temporal</label>
          <input
            type="password"
            value={newMember.temporaryPassword}
            onChange={(event) => setNewMember((current) => ({ ...current, temporaryPassword: event.target.value }))}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="team-add-button" disabled={isAdding}>
          <UserPlus size={17} />
          {isAdding ? "Agregando…" : "Crear/invitar"}
        </button>
      </form>

      <p className="team-helper">
        Si cargás una clave temporal, el usuario entra con email y esa clave. Si la dejás vacía, se envía una invitación por email para que defina su acceso.
      </p>

      {message ? <div className="team-message">{message}</div> : null}
      {error ? <div className="team-message error" role="alert">{error}</div> : null}

      <div className="team-list">
        {isLoading ? (
          <div className="team-loading"><RefreshCw size={16} /> Cargando equipo…</div>
        ) : members.length ? (
          members.map((member) => (
            <TeamMemberRow key={member.id} member={member} currentUserId={user?.id} currentRole={profile?.role} onUpdate={updateMember} onDelete={handleDeleteMember} />
          ))
        ) : (
          <div className="team-empty"><ShieldCheck size={18} /> Todavía no hay usuarios vinculados.</div>
        )}
      </div>
    </section>
  );
}

function Settings() {
  const { settings, updateSettings, isLoading, error } = useSettings();
  return (
    <PageTransition>
      <AdminLayout title="Configuración" subtitle="Identidad, contacto, mensajes, recibos y permisos del negocio.">
        {isLoading ? <Loader /> : error ? (
          <div className="settings-load-error">No pudimos cargar la configuración.</div>
        ) : (
          <div className="settings-page-stack">
            <SettingsForm key={JSON.stringify(settings)} initialSettings={settings} onSave={updateSettings} />
            <TeamSettings />
          </div>
        )}
      </AdminLayout>
    </PageTransition>
  );
}

export default Settings;
