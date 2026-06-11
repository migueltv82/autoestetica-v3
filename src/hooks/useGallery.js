import { useState } from "react";
import { getTodayString, shiftDateByDays } from "../utils/date";

const STORAGE_KEY = "autoestetica_gallery";

function createDefaultImages() {
  return [
    {
      id: 1,
      title: "Restauración de BMW M3",
      service: "Tratamiento Cerámico",
      beforeUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=800",
      afterUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
      date: shiftDateByDays(-15),
      status: "published",
    },
    {
      id: 2,
      title: "Limpieza Profunda de Interiores",
      service: "Detallado Interior",
      beforeUrl: "https://images.unsplash.com/photo-1549317661-bc32c5ce24af?q=80&w=800",
      afterUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800",
      date: shiftDateByDays(-5),
      status: "published",
    },
    {
      id: 3,
      title: "Corrección de Pintura & Brillo",
      service: "Pulido 3 Pasos",
      beforeUrl: "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=800",
      afterUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=800",
      date: getTodayString(),
      status: "published",
    },
    {
      id: 4,
      title: "Detallado Técnico de Motor",
      service: "Limpieza a Vapor",
      beforeUrl: "https://images.unsplash.com/photo-1621905252507-b354bc2a196c?q=80&w=800",
      afterUrl: "https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=800",
      date: getTodayString(),
      status: "published",
    },
  ];
}

function loadInitialGallery() {
  const defaultImages = createDefaultImages();

  if (typeof window === "undefined") {
    return defaultImages;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultImages));
  } catch {
    return defaultImages;
  }

  return defaultImages;
}

export function useGallery() {
  const [images, setImages] = useState(loadInitialGallery);

  const saveToLocal = (newImages) => {
    setImages(newImages);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
    } catch {
      console.warn("Storage quota exceeded or error saving to localStorage.");
      alert("La memoria del navegador esta llena. Borra algunas fotos pesadas para continuar.");
    }
  };

  const addImage = (imgData) => {
    const newDoc = {
      id: Date.now(),
      status: "published",
      date: getTodayString(),
      ...imgData,
    };

    saveToLocal([newDoc, ...images]);
  };

  const deleteImage = (id) => {
    saveToLocal(images.filter((img) => img.id !== id));
  };

  const toggleStatus = (id) => {
    const nextImages = images.map((img) => {
      if (img.id === id) {
        return { ...img, status: img.status === "published" ? "draft" : "published" };
      }

      return img;
    });

    saveToLocal(nextImages);
  };

  return {
    images,
    publishedImages: images.filter((image) => image.status === "published"),
    addImage,
    deleteImage,
    toggleStatus,
  };
}
