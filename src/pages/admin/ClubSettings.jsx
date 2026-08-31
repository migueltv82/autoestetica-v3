import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Crown,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Loader from "../../components/ui/Loader";
import PageTransition from "../../components/ui/PageTransition";
import { DEFAULT_CLUB_PLAN, validateClubPlan } from "../../services/clubApi";
import { useAdminClubPlans } from "../../hooks/useClubPlans";
import { useFeedback } from "../../hooks/useFeedback";
import "./ClubSettings.css";

const currencyFormatter = (currency) => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: currency || "ARS",
  maximumFractionDigits: 0,
});

function createDraftPlan() {
  return {
    ...DEFAULT_CLUB_PLAN,
    features: [...DEFAULT_CLUB_PLAN.features],
  };
}

function formatPlanPrice(plan) {
  return Number(plan.price) > 0
    ? currencyFormatter(plan.currency).format(Number(plan.price))
    : "Consultar";
}

function StatusPill({ active }) {
  return (
    <span className={`club-status-pill ${active ? "active" : "draft"}`}>
      {active ? "Publicado" : "Borrador"}
    </span>
  );
}

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`club-switch ${checked ? "is-on" : "is-off"}`}
    >
      <span className="club-switch-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="club-switch-control" aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

function PlansSkeleton() {
  return (
    <div className="club-admin-grid" aria-label="Cargando membresías">
      <aside className="club-sidebar">
        {[0, 1, 2].map((item) => (
          <div key={item} className="club-skeleton-card" />
        ))}
      </aside>
      <section className="club-editor-empty club-skeleton-editor" />
    </div>
  );
}

function EmptyEditor({ onNew }) {
  return (
    <section className="club-editor-empty">
      <div className="club-empty-icon">
        <Crown size={26} />
      </div>
      <h2>Seleccioná un plan o creá uno nuevo</h2>
      <p>
        Podés preparar planes con anticipación y publicar solamente los que quieras mostrar en la landing.
      </p>
      <button type="button" onClick={onNew} className="btn-primary-admin">
        <Plus size={17} /> Crear plan
      </button>
    </section>
  );
}

function PlanList({ plans, selectedId, onEdit, onDelete, onNew }) {
  return (
    <aside className="club-sidebar">
      <header className="club-sidebar-header">
        <div>
          <span className="club-kicker">Planes</span>
          <h2>{plans.length} cargado{plans.length === 1 ? "" : "s"}</h2>
        </div>
        <button type="button" onClick={onNew} className="btn-primary-admin club-new-plan-btn">
          <Plus size={16} /> Nuevo
        </button>
      </header>

      <div className="club-plan-list">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`club-plan-card ${selectedId === plan.id ? "selected" : ""}`}
          >
            <button type="button" className="club-plan-main" onClick={() => onEdit(plan)}>
              <span className="club-plan-topline">
                <StatusPill active={plan.isActive} />
                <strong>{formatPlanPrice(plan)}</strong>
              </span>
              <span className="club-plan-title">{plan.title}</span>
              <span className="club-plan-subtitle">{plan.subtitle || "Sin subtítulo cargado"}</span>
            </button>

            <div className="club-plan-actions">
              <button
                type="button"
                onClick={() => onEdit(plan)}
                className="btn-icon-sm"
                title="Editar plan"
                aria-label={`Editar ${plan.title}`}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(plan)}
                className="btn-icon-danger-sm"
                title="Borrar plan"
                aria-label={`Borrar ${plan.title}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}

        {!plans.length ? (
          <div className="club-empty-list">
            Todavía no hay planes de membresía.
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function ClubPlanForm({ initialPlan, onSave, onSaved }) {
  const [form, setForm] = useState(initialPlan);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialPlan), [form, initialPlan]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateFeature(index, value) {
    setForm((current) => ({
      ...current,
      features: current.features.map((feature, currentIndex) => (
        currentIndex === index ? value : feature
      )),
    }));
  }

  function addFeature() {
    setForm((current) => ({ ...current, features: [...current.features, ""] }));
  }

  function deleteFeature(index) {
    setForm((current) => ({
      ...current,
      features: current.features.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    const validationErrors = validateClubPlan(form);
    if (validationErrors.length) {
      setError(validationErrors.join(" "));
      return;
    }

    setIsSaving(true);
    try {
      const saved = await onSave(form);
      setForm(saved);
      onSaved(saved);
    } catch (saveError) {
      console.error("No se pudo guardar el plan del Club:", saveError);
      setError(saveError.message || "No se pudo guardar el plan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="club-editor-grid">
      <main className="club-editor-main">
        <section className="club-editor-card club-editor-status">
          <ToggleSwitch
            checked={form.isActive}
            onChange={(value) => updateField("isActive", value)}
            label={form.isActive ? "Plan publicado" : "Plan en borrador"}
            description="Cuando no hay planes publicados, la landing muestra el banner Próximamente."
          />
        </section>

        <section className="club-editor-card">
          <header className="club-section-header">
            <div>
              <span className="club-kicker">Datos comerciales</span>
              <h3>Contenido del plan</h3>
            </div>
            <p>Esto es lo que el cliente ve en la landing.</p>
          </header>

          <div className="club-form-grid">
            <label className="club-field club-field-wide">
              <span>Título</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Club Autoestética Premium"
              />
            </label>

            <label className="club-field">
              <span>Precio mensual</span>
              <input
                type="number"
                min="0"
                step="100"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="25000"
              />
            </label>

            <label className="club-field">
              <span>Moneda</span>
              <input
                value={form.currency}
                onChange={(event) => updateField("currency", event.target.value.toUpperCase())}
                placeholder="ARS"
              />
            </label>

            <label className="club-field club-field-wide">
              <span>Subtítulo</span>
              <textarea
                rows="4"
                value={form.subtitle}
                onChange={(event) => updateField("subtitle", event.target.value)}
                placeholder="Propuesta comercial del plan"
              />
            </label>
          </div>
        </section>

        <section className="club-editor-card">
          <header className="club-section-header">
            <div>
              <span className="club-kicker">Links e imagen</span>
              <h3>Checkout y apoyo visual</h3>
            </div>
            <p>El link de Mercado Pago habilita el botón público.</p>
          </header>

          <div className="club-form-grid">
            <label className="club-field">
              <span>URL de Mercado Pago</span>
              <input
                type="url"
                value={form.checkoutUrl}
                onChange={(event) => updateField("checkoutUrl", event.target.value)}
                placeholder="https://www.mercadopago.com.ar/..."
              />
            </label>

            <label className="club-field">
              <span>URL de imagen</span>
              <span className="club-input-icon">
                <ImageIcon size={16} />
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => updateField("imageUrl", event.target.value)}
                  placeholder="https://..."
                />
              </span>
            </label>
          </div>
        </section>

        <section className="club-editor-card">
          <header className="club-section-header club-section-header-actions">
            <div>
              <span className="club-kicker">Detalle del plan</span>
              <h3>Qué incluye la suscripción</h3>
              <p>Cargá ítems concretos: lavados incluidos, descuentos, prioridad de turnos o beneficios del club.</p>
            </div>
            <button type="button" onClick={addFeature} className="btn-ghost">
              <Plus size={16} /> Agregar ítem
            </button>
          </header>

          <div className="club-feature-list">
            {form.features.map((feature, index) => (
              <div key={`included-item-${index}`} className="club-feature-row">
                <input
                  value={feature}
                  onChange={(event) => updateFeature(index, event.target.value)}
                  placeholder={`Incluido ${index + 1}: ej. 1 Lavado Premium mensual`}
                />
                <button
                  type="button"
                  onClick={() => deleteFeature(index)}
                  className="btn-icon-danger-sm"
                  title="Eliminar ítem"
                  aria-label={`Eliminar ítem incluido ${index + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="club-editor-card club-editor-status">
          <ToggleSwitch
            checked={form.fidelityCardActive}
            onChange={(value) => updateField("fidelityCardActive", value)}
            label="Tarjeta Fidelity física"
            description="Muestra la tarjeta de troqueles: al completar 4 lavados, el 5° Lavado Premium es gratis."
          />
        </section>

        {error ? (
          <div className="club-alert error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="club-form-actions">
          <span>
            {isDirty ? "Hay cambios sin guardar." : "No hay cambios pendientes."}
          </span>
          <button type="submit" disabled={isSaving || !isDirty} className="btn-primary-admin">
            {isSaving ? <Loader2 size={18} className="club-spin" /> : <Save size={18} />}
            {isSaving ? "Guardando..." : "Guardar plan"}
          </button>
        </div>
      </main>

      <aside className="club-preview-card">
        <span className="club-kicker">Vista rápida</span>
        <div className="club-preview-header">
          <h3>{form.title || "Club Autoestética Premium"}</h3>
          <StatusPill active={form.isActive} />
        </div>
        <p>{form.subtitle || "Sin descripción cargada."}</p>

        <div className="club-preview-price">
          <small>Precio</small>
          <strong>{formatPlanPrice(form)}</strong>
        </div>

        <ul className="club-preview-features">
          {form.features.filter(Boolean).slice(0, 5).map((feature) => (
            <li key={feature}>
              <CheckCircle2 size={17} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="club-preview-notes">
          <span>
            Checkout: <strong className={form.checkoutUrl ? "ok" : "warning"}>
              {form.checkoutUrl ? "Configurado" : "Pendiente"}
            </strong>
          </span>
          <span>
            Fidelity: <strong className={form.fidelityCardActive ? "ok" : "muted"}>
              {form.fidelityCardActive ? "Visible" : "Oculta"}
            </strong>
          </span>
        </div>
      </aside>
    </form>
  );
}

function ClubSettings() {
  const { confirm, notify } = useFeedback();
  const {
    plans,
    isCheckingAdmin,
    isClubAdmin,
    isLoading,
    error,
    upsertPlan,
    removePlan,
    refresh,
  } = useAdminClubPlans();
  const [editingPlan, setEditingPlan] = useState(null);

  async function savePlan(plan) {
    try {
      const saved = await upsertPlan(plan);
      notify("Plan del Club guardado.", "success");
      return saved;
    } catch (saveError) {
      notify(saveError.message || "No se pudo guardar el plan.", "error");
      throw saveError;
    }
  }

  async function deletePlan(plan) {
    const accepted = await confirm({
      title: "Borrar plan del Club",
      message: `Se eliminará "${plan.title}". Esta acción no se puede deshacer.`,
      confirmLabel: "Borrar plan",
    });
    if (!accepted) return;

    try {
      await removePlan(plan.id);
      if (editingPlan?.id === plan.id) setEditingPlan(null);
      notify("Plan eliminado.", "success");
    } catch (deleteError) {
      console.error("No se pudo borrar el plan del Club:", deleteError);
      notify(deleteError.message || "No se pudo borrar el plan.", "error");
    }
  }

  return (
    <PageTransition>
      <AdminLayout>
        <div className="club-page-stack">
          <AdminPageHeader
            eyebrow="Club de usuarios"
            icon={<Crown size={18} />}
            title="Membresías"
            subtitle="Gestioná planes, beneficios, checkout y Tarjeta Fidelity desde el panel."
            actions={(
              <>
                <button type="button" className="btn-ghost" onClick={refresh}>
                  <RefreshCw size={16} /> Actualizar
                </button>
                <a className="btn-ghost" href="/" target="_blank" rel="noreferrer">
                  Ver landing <ExternalLink size={16} />
                </a>
              </>
            )}
          />

          {isCheckingAdmin ? <Loader /> : !isClubAdmin ? (
            <section className="club-access-alert">
              <ShieldAlert size={26} />
              <div>
                <h2>Tu usuario todavía no está autorizado en public.admins</h2>
                <p>
                  Para administrar membresías, agregá tu auth.uid() real en la tabla admins.
                  La ruta exige login, pero el alta y edición quedan protegidas por RLS.
                </p>
              </div>
            </section>
          ) : isLoading ? <PlansSkeleton /> : error ? (
            <div className="club-alert error" role="alert">
              {error}
            </div>
          ) : (
            <div className="club-admin-grid">
              <PlanList
                plans={plans}
                selectedId={editingPlan?.id}
                onEdit={setEditingPlan}
                onDelete={deletePlan}
                onNew={() => setEditingPlan(createDraftPlan())}
              />
              {editingPlan ? (
                <ClubPlanForm
                  key={editingPlan.id || "new-plan"}
                  initialPlan={editingPlan}
                  onSave={savePlan}
                  onSaved={setEditingPlan}
                />
              ) : (
                <EmptyEditor onNew={() => setEditingPlan(createDraftPlan())} />
              )}
            </div>
          )}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default ClubSettings;
