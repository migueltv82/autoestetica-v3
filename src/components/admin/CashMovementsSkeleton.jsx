import "./skeleton.css";

function CashMovementsSkeleton() {
  return (
    <section className="cash-movement-list skeleton-anim" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <article key={i}>
          <span className="skeleton-badge skeleton-avatar-round"></span>
          <div className="cash-movement-main">
            <div className="skeleton-line skeleton-w-70"></div>
            <div className="skeleton-line skeleton-w-50" style={{ marginTop: "0.4rem" }}></div>
          </div>
          <div className="skeleton-line skeleton-w-80"></div>
          <div className="skeleton-line" style={{ marginLeft: "auto", width: "60%" }}></div>
        </article>
      ))}
    </section>
  );
}

export default CashMovementsSkeleton;
