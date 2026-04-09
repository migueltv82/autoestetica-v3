import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loader from "../components/ui/Loader";

// Public pages
const Home = lazy(() => import("../pages/public/Home"));
const Services = lazy(() => import("../pages/public/Services"));
const Contact = lazy(() => import("../pages/public/Contact"));
const Inquiry = lazy(() => import("../pages/public/Inquiry"));

// Admin pages
const Login = lazy(() => import("../pages/admin/Login"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Turns = lazy(() => import("../pages/admin/Turns"));
const Cash = lazy(() => import("../pages/admin/Cash"));
const Clients = lazy(() => import("../pages/admin/Clients"));
const AdminServices = lazy(() => import("../pages/admin/AdminServices"));
const Gallery = lazy(() => import("../pages/admin/Gallery"));
const Settings = lazy(() => import("../pages/admin/Settings"));

export default function RouterProviderApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/consulta" element={<Inquiry />} />
          <Route path="/contacto" element={<Contact />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/turnos" element={<Turns />} />
          <Route path="/admin/caja" element={<Cash />} />
          <Route path="/admin/clientes" element={<Clients />} />
          <Route path="/admin/servicios" element={<AdminServices />} />
          <Route path="/admin/galeria" element={<Gallery />} />
          <Route path="/admin/configuracion" element={<Settings />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}