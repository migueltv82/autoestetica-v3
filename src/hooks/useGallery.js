import { useState } from "react";
import { getTodayString, shiftDateByDays } from "../utils/date";

const STORAGE_KEY = "autoestetica_gallery";

function createDefaultImages() {
  return [
    {
      id: 1,
      title: "Restauracion de BMW M3",
      service: "Tratamiento ceramico",
      beforeUrl: "https://images.unsplash.com/photo-1549317661-bc32c5ce24af?auto=format&fit=crop&q=80&w=800",
      afterUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
      date: shiftDateByDays(-15),
      status: "published",
    },
    {
      id: 2,
      title: "Limpieza profunda de interiores",
      service: "Detallado interior",
      beforeUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800",
      afterUrl: "https://images.unsplash.com/photo-1583344310574-1dae75c60e32?auto=format&fit=crop&q=80&w=800",
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
