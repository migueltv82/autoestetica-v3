import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import Services from "../pages/public/Services";
import Contact from "../pages/public/Contact";
import Inquiry from "../pages/public/Inquiry";
import Login from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import Turns from "../pages/admin/Turns";
import Cash from "../pages/admin/Cash";
import Clients from "../pages/admin/Clients";
import AdminServices from "../pages/admin/AdminServices";
import Settings from "../pages/admin/Settings";

function RouterProviderApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/consulta" element={<Inquiry />} />
        <Route path="/contacto" element={<Contact />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/turnos" element={<Turns />} />
        <Route path="/admin/caja" element={<Cash />} />
        <Route path="/admin/clientes" element={<Clients />} />
        <Route path="/admin/servicios" element={<AdminServices />} />
        <Route path="/admin/configuracion" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RouterProviderApp;