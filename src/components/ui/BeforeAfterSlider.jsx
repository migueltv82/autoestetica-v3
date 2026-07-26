import { useState } from "react";
import "./BeforeAfterSlider.css";

function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  title,
  service,
  beforeLabel = "ANTES",
  afterLabel = "DESPUÉS",
  className = "",
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const position = Math.max(0, Math.min(100, Math.round(sliderPosition)));

  return (
    <div
      className={`ba-slider-container ${className}`.trim()}
      style={{ "--ba-slider-position": `${position}%` }}
    >
      <div className="ba-image after-image">
        <img src={afterUrl} alt={afterLabel} />
        <div className="ba-label after-label">{afterLabel}</div>
      </div>

      <div className="ba-image before-image">
        <img src={beforeUrl} alt={beforeLabel} />
        <div className="ba-label before-label">{beforeLabel}</div>
      </div>

      <input
        className="ba-range"
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setSliderPosition(Number(event.target.value))}
        aria-label={`Comparar antes y después de ${title || "este trabajo"}`}
      />

      <div className="ba-handle" aria-hidden="true">
        <div className="ba-handle-line" />
        <div className="ba-handle-arrows">
          <span />
          <span />
        </div>
      </div>

      <div className="ba-helper">Deslizá para comparar</div>

      {(title || service) ? (
        <div className="ba-footer">
          {title ? <span className="ba-title">{title}</span> : null}
          {service ? <span className="ba-service">{service}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export default BeforeAfterSlider;
