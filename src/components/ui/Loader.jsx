import { Loader2 } from "lucide-react";
import "./Loader.css";

export default function Loader({ size = 48, className = "" }) {
  return (
    <div className={["loader-shell", className].filter(Boolean).join(" ")}>
      <Loader2 size={size} className="loader-spinner" />
    </div>
  );
}
