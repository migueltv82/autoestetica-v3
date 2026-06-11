import Navbar from "./Navbar";
import Footer from "./Footer";
import "./PublicLayout.css";

function PublicLayout({ children, className = "" }) {
  return (
    <div className={`public-layout ${className}`.trim()}>
      <Navbar />
      <main className="public-main">{children}</main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
