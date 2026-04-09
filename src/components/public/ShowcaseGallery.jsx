import { motion } from "framer-motion";
import { useGallery } from "../../hooks/useGallery";
import "./ShowcaseGallery.css";
import { ChevronRight } from "lucide-react";

function ShowcaseGallery() {
  const { publishedImages } = useGallery();

  if (publishedImages.length === 0) return null;

  return (
    <section className="showcase-section">
      <div className="container">
        <div className="showcase-header">
          <motion.h2 
            className="showcase-title section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Nuestros Resultados
          </motion.h2>
          <motion.p
            className="showcase-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Deslizá para descubrir cómo elevamos el estándar de estética vehicular en cada unidad que ingresa a nuestro taller.
          </motion.p>
        </div>

        <div className="showcase-carousel-wrapper">
          <div className="showcase-carousel">
            {publishedImages.map((item, i) => (
              <motion.div 
                className="showcase-card"
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="showcase-image-wrap">
                  {item.beforeUrl ? (
                    <div className="showcase-comparison">
                      <div className="showcase-half">
                        <span className="showcase-badge before-badge">ANTES</span>
                        <img src={item.beforeUrl} alt={`Antes de ${item.title}`} loading="lazy" />
                      </div>
                      <div className="showcase-half">
                        <span className="showcase-badge after-badge">DESPUÉS</span>
                        <img src={item.afterUrl} alt={`Después de ${item.title}`} loading="lazy" />
                      </div>
                    </div>
                  ) : (
                    <div className="showcase-single">
                      <img src={item.afterUrl} alt={item.title} loading="lazy" />
                      <div className="showcase-overlay-gradient" />
                    </div>
                  )}
                </div>
                
                <div className="showcase-card-body">
                  <span className="showcase-category">{item.service}</span>
                  <h3 className="showcase-card-title">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="carousel-fade-right">
             <ChevronRight size={32} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShowcaseGallery;
