import { existsSync, readFileSync } from "node:fs";

const envFiles = [".env", ".env.local", ".env.production"].filter(existsSync);
const cleanValue = (value) => value.trim().replace(/^(['"])(.*)\1$/, "$2");
const fileValues = Object.fromEntries(
  envFiles
    .flatMap((file) => readFileSync(file, "utf8").split(/\r?\n/))
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator).trim(), cleanValue(line.slice(separator + 1))];
    })
);
const values = { ...fileValues, ...process.env };

const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_ORGANIZATION_SLUG"];
const missing = required.filter((key) => !values[key] || /TU_|example|localhost/i.test(values[key]));

if (missing.length) {
  console.error(`Configuración incompleta: ${missing.join(", ")}`);
  process.exit(1);
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(values.VITE_SUPABASE_URL)) {
  console.error("VITE_SUPABASE_URL no parece una URL válida de Supabase.");
  process.exit(1);
}

if (values.VITE_SUPABASE_ANON_KEY.toLowerCase().includes("service_role")) {
  console.error("No uses la clave service_role en el frontend.");
  process.exit(1);
}

console.log("Configuración de despliegue verificada.");
