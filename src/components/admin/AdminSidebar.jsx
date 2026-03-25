import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Users,
  Wrench,
  Settings,
  LogIn,
} from "lucide-react";
import "./AdminSidebar.css";

const items = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    to: "/admin/turnos",
    label: "Turnos",
    icon: <CalendarDays size={18} />,
  },
  {
    to: "/admin/caja",
    label: "Caja",
    icon: <Wallet size={18} />,
  },
  {
    to: "/admin/clientes",
    label: "Clientes",
    icon: <Users size={18} />,
  },
  {
    to: "/admin/servicios",
    label: "Servicios",
    icon: <Wrench size={18} />,
  },
  {
    to: "/admin/configuracion",
    label: "Configuración",
    icon: <Settings size={18} />,
  },
];

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-dot"></span>
        <div>
          <strong>Autoestética</strong>
          <p>Tucumán Admin</p>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className="admin-sidebar-link">
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <NavLink to="/admin/login" className="admin-logout-link">
          <LogIn size={18} />
          <span>Cambiar cuenta</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default AdminSidebar;