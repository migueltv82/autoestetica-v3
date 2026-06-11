import coverExterior from "../assets/hero-polishing.jpeg";
import coverInterior from "../assets/result-interior.jpg";
import coverTechnical from "../assets/result-engine.jpeg";

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

export function getServiceCoverUrl(service) {
  if (service?.coverImageUrl) return service.coverImageUrl;

  const first = service?.gallery?.[0]?.url;
  if (first) return first;

  const category = classifyService(service);
  return TEST_COVERS[category] || coverExterior;
}

export function getServicePreviewGallery(service) {
  if (service?.gallery?.length) return service.gallery;
  return [{ url: getServiceCoverUrl(service), label: "Imagen de prueba" }];
}

