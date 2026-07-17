import Navbar from "./Navbar";
import Footer from "./Footer";
import "./PublicLayout.css";

function PublicLayout({ children, className = "" }) {
  return (
    <div className={`public-layout ${className}`.trim()}>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <Navbar />
      <main className="public-main" id="main-content" tabIndex="-1">{children}</main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
