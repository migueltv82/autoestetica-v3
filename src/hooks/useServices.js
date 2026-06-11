import { useState, useEffect } from 'react';

const STORAGE_KEY = 'autoestetica_services';
const STORAGE_VERSION = 'v3'; // bump when schema changes
const STORAGE_VERSION_KEY = 'autoestetica_services_version';

const DEFAULT_DISPLAY = {
  name: true,
  description: true,
  gallery: true,
  duration: true,
  price: true
};

/** Ensure every service record has the new fields */
function migrateService(s) {
  return {
    ...s,
    coverImageUrl: s.coverImageUrl || '',
    iconName: s.iconName || 'Zap',
    gallery: Array.isArray(s.gallery) ? s.gallery : [],
    display: s.display ? { ...DEFAULT_DISPLAY, ...s.display } : { ...DEFAULT_DISPLAY },
  };
}

function loadFromStorage() {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || version !== STORAGE_VERSION) return null; // schema changed → use INITIAL_DATA
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(migrateService) : null;
  } catch {
    return null;
  }
}

const INITIAL_DATA = [
  { 
    id: "ser-1", 
    name: "Lavado Premium", 
    price: 15000, 
    duration: "2h", 
    description: "Lavado detallado con cera rápida y aspirado profundo de tapizados y alfombras.", 
    iconName: "Zap", 
    featured: true,
    display: {
      name: true,
      description: true,
      gallery: true,
      duration: true,
      price: true
    },
    gallery: [
      { url: "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=1470&auto=format&fit=crop", label: "Finalizado" },
      { url: "https://images.unsplash.com/photo-1542462662-e17ee96c262d?q=80&w=1470&auto=format&fit=crop", label: "Proceso" },
    ]
  },
  { 
    id: "ser-2", 
    name: "Limpieza de Interior", 
    price: 25000, 
    duration: "4h", 
    description: "Limpieza textil, cueros y plásticos con protección UV y nutrición de superficies.", 
    iconName: "Droplets",
    display: {
      name: true,
      description: true,
      gallery: true,
      duration: true,
      price: true
    },
    gallery: []
  },
  { 
    id: "ser-3", 
    name: "Tratamiento Acrílico", 
    price: 45000, 
    duration: "6h", 
    description: "Corrección de micro-rayas (swirls), abrillantado profundo y sellado acrílico protector.", 
    iconName: "ShieldCheck", 
    featured: true,
    display: {
      name: true,
      description: true,
      gallery: true,
      duration: true,
      price: true
    },
    gallery: []
  },
  { 
    id: "ser-4", 
    name: "Lavado de Motor", 
    price: 8500, 
    duration: "1h", 
    description: "Limpieza técnica de motor a vapor con productos dieléctricos y terminación satinada.", 
    iconName: "Sparkles",
    display: {
      name: true,
      description: true,
      gallery: true,
      duration: true,
      price: false
    },
    gallery: []
  },
];

export function useServices() {
  const [services, setServices] = useState(() => loadFromStorage() ?? INITIAL_DATA);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
  }, [services]);

  const addService = (serviceData) => {
    const newService = {
      ...serviceData,
      id: `ser-${Date.now()}`,
      gallery: serviceData.gallery || [],
      display: serviceData.display || {
        name: true,
        description: true,
        gallery: true,
        duration: true,
        price: true
      }
    };
    setServices(prev => [...prev, newService]);
    return newService;
  };

  const updateService = (id, updatedFields) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, ...updatedFields } : service
    ));
  };

  const deleteService = (id) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const toggleFeatured = (id) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, featured: !service.featured } : service
    ));
  };

  // Helper to update specific visibility setting
  const updateVisibility = (serviceId, key, value) => {
    setServices(prev => prev.map(service => {
      if (service.id === serviceId) {
        return {
          ...service,
          display: {
            ...service.display,
            [key]: value
          }
        };
      }
      return service;
    }));
  };

  return {
    services,
    featuredServices: services.filter(s => s.featured),
    addService,
    updateService,
    deleteService,
    toggleFeatured,
    updateVisibility
  };
}
