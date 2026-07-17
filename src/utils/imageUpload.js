export async function compressImageFile(file, options = {}) {
  const { maxWidth = 1800, maxHeight = 1200, quality = 0.84 } = options;
  if (!file?.type?.startsWith("image/")) throw new Error("Selecciona un archivo de imagen valido.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  canvas.getContext("2d", { alpha: false }).drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error("No se pudo comprimir la imagen.")),
    "image/webp", quality,
  ));
}
