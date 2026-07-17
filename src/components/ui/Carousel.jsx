import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Hash } from "lucide-react";
import "./Carousel.css";

function Carousel({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="carousel-empty">
        <p>No hay imágenes disponibles para este servicio todavía.</p>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="carousel-wrapper">
      <div className="carousel-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="carousel-slide"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <img src={images[currentIndex].url} alt={images[currentIndex].label || `Imagen ${currentIndex + 1} de ${images.length}`} loading="lazy" decoding="async" />
            {images[currentIndex].label && (
              <div className="carousel-caption">
                <Hash size={14} />
                <span>{images[currentIndex].label}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button type="button" className="carousel-nav prev" onClick={prevSlide} aria-label="Imagen anterior">
              <ChevronLeft size={24} />
            </button>
            <button type="button" className="carousel-nav next" onClick={nextSlide} aria-label="Imagen siguiente">
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            type="button"
            key={index}
            className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ver imagen ${index + 1}`}
            aria-current={index === currentIndex ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
