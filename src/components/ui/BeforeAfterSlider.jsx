import { useState, useRef, useEffect } from "react";
import "./BeforeAfterSlider.css";

function BeforeAfterSlider({ beforeUrl, afterUrl, title, service }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  function handleMove(event) {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.touches ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    
    // Clamp between 0 and 100
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }

  return (
    <div 
      className="ba-slider-container" 
      ref={containerRef}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="ba-image after-image">
         <img src={afterUrl} alt="Después" />
         <div className="ba-label after-label">DESPUÉS</div>
      </div>

      <div 
        className="ba-image before-image" 
        style={{ width: `${sliderPosition}%` }}
      >
        <img src={beforeUrl} alt="Antes" />
        <div className="ba-label before-label">ANTES</div>
      </div>

      <div 
        className="ba-handle" 
        style={{ left: `${sliderPosition}%` }}
      >
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
