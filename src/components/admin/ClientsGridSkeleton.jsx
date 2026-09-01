import "./skeleton.css";

function ClientsGridSkeleton() {
  return (
    <section className="clients-directory skeleton-anim" aria-hidden="true">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <article className="client-card" key={i}>
          <header>
            <div className="skeleton-badge skeleton-avatar"></div>
            <div>
              <div className="skeleton-line skeleton-w-70"></div>
              <div className="skeleton-line skeleton-w-50" style={{ marginTop: "0.5rem" }}></div>
            </div>
          </header>
          <div className="client-card-facts">
            <span><div className="skeleton-line"></div></span>
            <span><div className="skeleton-line"></div></span>
            <span><div className="skeleton-line"></div></span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default ClientsGridSkeleton;
