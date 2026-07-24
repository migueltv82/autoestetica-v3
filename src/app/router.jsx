import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loader from "../components/ui/Loader";
import ScrollToTop from "../components/ui/ScrollToTop";
import ProtectedRoute from "../components/admin/ProtectedRoute";
import Seo from "../components/ui/Seo";
import { OWNER_ADMIN_ROLES, OWNER_ROLES } from "../utils/permissions";

// Public pages
const Home = lazy(() => import("../pages/public/Home"));
const Services = lazy(() => import("../pages/public/Services"));
const ServiceDetail = lazy(() => import("../pages/public/ServiceDetail"));
const Gallery = lazy(() => import("../pages/public/Gallery"));
const Contact = lazy(() => import("../pages/public/Contact"));
const Inquiry = lazy(() => import("../pages/public/Inquiry"));
const Privacy = lazy(() => import("../pages/public/Privacy"));
const Terms = lazy(() => import("../pages/public/Terms"));
const ClientFidelityCardPage = lazy(() => import("../pages/public/ClientFidelityCardPage"));

// Admin pages
const Login = lazy(() => import("../pages/admin/Login"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Turns = lazy(() => import("../pages/admin/Turns"));
const Cash = lazy(() => import("../pages/admin/Cash"));
const Clients = lazy(() => import("../pages/admin/Clients"));
const AdminServices = lazy(() => import("../pages/admin/AdminServices"));
const GalleryAdmin = lazy(() => import("../pages/admin/Gallery"));
const Settings = lazy(() => import("../pages/admin/Settings"));

export default function RouterProviderApp() {
  const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;
  const protectOwnerAdmin = (element) => <ProtectedRoute roles={OWNER_ADMIN_ROLES}>{element}</ProtectedRoute>;
  const protectOwner = (element) => <ProtectedRoute roles={OWNER_ROLES}>{element}</ProtectedRoute>;
  return (
    <BrowserRouter>
      <Seo />
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/servicios/:slug" element={<ServiceDetail />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/consulta" element={<Inquiry />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/terminos" element={<Terms />} />
          <Route path="/tarjeta" element={<ClientFidelityCardPage />} />
          <Route path="/mi-tarjeta" element={<ClientFidelityCardPage />} />
          <Route path="/clientes" element={<ClientFidelityCardPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={protectOwnerAdmin(<Dashboard />)} />
          <Route path="/admin/turnos" element={protect(<Turns />)} />
          <Route path="/admin/caja" element={protectOwnerAdmin(<Cash />)} />
          <Route path="/admin/clientes" element={protect(<Clients />)} />
          <Route path="/admin/servicios" element={protectOwnerAdmin(<AdminServices />)} />
          <Route path="/admin/galeria" element={protectOwnerAdmin(<GalleryAdmin />)} />
          <Route path="/admin/configuracion" element={protectOwner(<Settings />)} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
