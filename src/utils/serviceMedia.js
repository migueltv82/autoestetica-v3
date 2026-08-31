import coverExterior from "../assets/hero-polishing.webp";
import coverInterior from "../assets/result-interior.webp";
import coverTechnical from "../assets/result-engine.webp";
import premiumWorkshop from "../assets/services-detailing/lavado-premium-taller.webp";
import interiorWorkshop from "../assets/services-detailing/limpieza-interior-hilux.webp";
import polishWorkshop from "../assets/services-detailing/abrillantado-taller.webp";
import ceramicWorkshop from "../assets/services-detailing/tratamiento-ceramico.webp";
import bicycleWorkshop from "../assets/services-detailing/lavado-bicicleta.webp";
import motorcycleWorkshop from "../assets/services-detailing/lavado-moto.webp";

export function classifyService(service) {
  const name = (service?.name || "").toLowerCase();

  if (name.includes("interior")) return "interior";
  if (name.includes("motor") || name.includes("vapor")) return "technical";
  if (
    name.includes("acril") ||
    name.includes("ceram") ||
    name.includes("pulid") ||
    name.includes("tratam") ||
    name.includes("protecc") ||
    name.includes("sellad")
  ) {
    return "protection";
  }
  if (name.includes("lavado")) return "exterior";

  return "other";
}

const TEST_COVERS = {
  exterior: coverExterior,
  interior: coverInterior,
  technical: coverTechnical,
  protection: coverExterior,
  other: coverExterior,
};

const CURATED_SERVICE_IMAGES = {
  premium: [
    { url: premiumWorkshop, label: "Lavado premium en taller" },
  ],
  interior: [
    { url: interiorWorkshop, label: "Limpieza interior de Toyota Hilux" },
  ],
  polish: [
    { url: polishWorkshop, label: "Abrillantado profesional en taller" },
  ],
  protection: [
    { url: ceramicWorkshop, label: "Aplicacion de tratamiento ceramico" },
  ],
  bicycle: [
    { url: bicycleWorkshop, label: "Lavado de Specialized electrica enduro" },
  ],
  motorcycle: [
    { url: motorcycleWorkshop, label: "Lavado de KTM 1290 Super Adventure" },
  ],
};

function curatedKey(service) {
  const name = (service?.name || "").toLowerCase();
  if (name.includes("bicic")) return "bicycle";
  if (name.includes("moto")) return "motorcycle";
  if (name.includes("interior")) return "interior";
  if (name.includes("abrillant")) return "polish";
  if (name.includes("acril") || name.includes("ceram")) return "protection";
  if (name.includes("premium")) return "premium";
  return null;
}

export function getCuratedServiceGallery(service) {
  return CURATED_SERVICE_IMAGES[curatedKey(service)] || [];
}

export function getServiceCoverUrl(service) {
  if (service?.coverImageUrl) return service.coverImageUrl;

  const first = service?.gallery?.[0]?.url;
  if (first) return first;

  const curated = getCuratedServiceGallery(service)[0]?.url;
  if (curated) return curated;

  const category = classifyService(service);
  return TEST_COVERS[category] || coverExterior;
}

export function getServicePreviewGallery(service) {
  if (service?.gallery?.length) return service.gallery;
  const curated = getCuratedServiceGallery(service);
  if (curated.length) return curated;
  return [{ url: getServiceCoverUrl(service), label: "Imagen del servicio" }];
}
