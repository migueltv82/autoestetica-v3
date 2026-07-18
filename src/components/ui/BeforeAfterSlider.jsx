import { useState } from "react";
import "./BeforeAfterSlider.css";

function BeforeAfterSlider({ beforeUrl, afterUrl, title, service }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const position = Math.max(0, Math.min(100, Math.round(sliderPosition)));
  const positionClass = `ba-pos-${position}`;

  return (
    <div className="ba-slider-container">
      <div className="ba-image after-image">
        <img src={afterUrl} alt="Después" />
        <div className="ba-label after-label">DESPUÉS</div>
      </div>

      <div className={`ba-image before-image ${positionClass}`}>
        <img src={beforeUrl} alt="Antes" />
        <div className="ba-label before-label">ANTES</div>
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

      <div className={`ba-handle ${positionClass}`}>
        <div className="ba-handle-line"></div>
        <div className="ba-handle-arrows">
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="ba-footer">
        <span className="ba-title">{title}</span>
        <span className="ba-service">{service}</span>
      </div>
    </div>
  );
}

export default BeforeAfterSlider;
