import { CalendarCheck, Crown, UserRound, Users } from "lucide-react";
import { useSubscription } from "../../hooks/useSubscription";
import "./PlanSummary.css";

export default function PlanSummary() {
  const { subscription, usage, isLoading } = useSubscription();
  if (isLoading || !subscription) return null;

  const plan = subscription.plans;
  const metrics = [
    { key: "users", label: "Usuarios", icon: Users },
    { key: "clients", label: "Clientes", icon: UserRound },
    { key: "monthlyOrders", label: "Turnos este mes", icon: CalendarCheck },
  ];

  return (
    <section className="plan-summary dashboard-panel">
      <header>
        <span><Crown size={19} /></span>
        <div>
          <small>Plan actual</small>
          <h3>{plan.name}</h3>
          <p>{plan.description}</p>
        </div>
        <strong>{subscription.status === "active" ? "Activo" : subscription.status}</strong>
      </header>

      <div>
        {metrics.map(({ key, label, icon: Icon }) => {
          const limit = Number(plan.limits?.[key] || 0);
          const value = Number(usage[key] || 0);
          const percent = limit ? Math.min((value / limit) * 100, 100) : 0;

          return (
            <article key={key}>
              <span><Icon size={14} />{label}<b>{value} / {limit || "∞"}</b></span>
              <progress className="plan-metric-progress" max="100" value={percent} aria-label={`${label}: ${Math.round(percent)}% usado`} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
