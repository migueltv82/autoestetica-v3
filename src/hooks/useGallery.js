import { useState, useEffect } from "react";

export function useGallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("autoestetica_gallery");
    if (saved) {
      setImages(JSON.parse(saved));
    } else {
      // Default demo content so the gallery isn't empty upon first load
      const defaultImages = [
        {
          id: 1,
          title: "Restauración de BMW M3",
          service: "Tratamiento Cerámico",
          beforeUrl: "https://images.unsplash.com/photo-1549317661-bc32c5ce24af?auto=format&fit=crop&q=80&w=800", // example proxy
          afterUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800", 
          date: "2026-03-10",
          status: "published",
        },
        {
          id: 2,
          title: "Limpieza profunda de interiores",
          service: "Detallado Interior",
          beforeUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800",
          afterUrl: "https://images.unsplash.com/photo-1583344310574-1dae75c60e32?auto=format&fit=crop&q=80&w=800",
          date: "2026-03-25",
          status: "published",
        }
      ];
      setImages(defaultImages);
      localStorage.setItem("autoestetica_gallery", JSON.stringify(defaultImages));
    }
  }, []);

  const saveToLocal = (newImages) => {
    setImages(newImages);
    try {
      localStorage.setItem("autoestetica_gallery", JSON.stringify(newImages));
    } catch(e) {
      console.warn("Storage quota exceeded or error saving to localStorage.");
      alert("La memoria del navegador está llena. Borrá algunas fotos pesadas para continuar.");
    }
  };

  const addImage = (imgData) => {
    const newDoc = { 
      id: Date.now(), 
      status: "published", 
      date: new Date().toISOString().split("T")[0],
      ...imgData 
    };
    saveToLocal([newDoc, ...images]);
  };

  const deleteImage = (id) => {
    saveToLocal(images.filter(img => img.id !== id));
  };

  const toggleStatus = (id) => {
    const nextImages = images.map(img => {
      if(img.id === id) {
        return { ...img, status: img.status === "published" ? "draft" : "published" };
      }
      return img;
    });
    saveToLocal(nextImages);
  };

  return {
    images,
    publishedImages: images.filter(i => i.status === "published"),
    addImage,
    deleteImage,
    toggleStatus
  };
}
