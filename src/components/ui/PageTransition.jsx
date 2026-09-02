import "./PageTransition.css";

export default function PageTransition({ children, className = "" }) {
  return (
    <div className={["page-transition", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
