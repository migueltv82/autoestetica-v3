import "./SectionCard.css";

function SectionCard({ title, text, children }) {
  return (
    <article className="section-card-ui">
      {title ? <h2 className="section-card-ui-title">{title}</h2> : null}
      {text ? <p className="section-card-ui-text">{text}</p> : null}
      {children}
    </article>
  );
}

export default SectionCard;