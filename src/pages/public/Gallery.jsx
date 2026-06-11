import { motion } from "framer-motion";
import { useGallery } from "../../hooks/useGallery";
import BeforeAfterSlider from "../../components/ui/BeforeAfterSlider";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import "./Gallery.css";

const FADE_UP = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

function Gallery() {
  const { publishedImages } = useGallery();

  return (
    <PageTransition>
      <PublicLayout>
        <div className="public-gallery-page">
          <header className="gallery-hero">
            <div className="container">
              <motion.span className="gallery-kicker" {...FADE_UP}>
                Resultados reales
              </motion.span>
              <motion.h1 {...FADE_UP} transition={{ delay: 0.1 }}>
                Portfolio de excelencia
              </motion.h1>
              <motion.p {...FADE_UP} transition={{ delay: 0.2 }}>
                La evidencia de nuestro compromiso con el detalle. Deslizá para ver la transformación de cada vehículo.
              </motion.p>
            </div>
          </header>

          <section className="container gallery-results-grid">
            {publishedImages.length > 0 ? (
              publishedImages.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="gallery-item-wrapper"
                  {...FADE_UP}
                  transition={{ delay: idx * 0.1 }}
                >
                  <BeforeAfterSlider
                    beforeUrl={item.beforeUrl}
                    afterUrl={item.afterUrl}
                    title={item.title}
                    service={item.service}
                  />
                </motion.div>
              ))
            ) : (
              <div className="gallery-empty">
                <p>Estamos preparando nuevos casos para mostrarte. Volvé pronto.</p>
              </div>
            )}
          </section>
        </div>
      </PublicLayout>
    </PageTransition>
  );
}

export default Gallery;
