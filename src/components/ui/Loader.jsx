import { Loader2 } from "lucide-react";

export default function Loader({ size = 48, className = "" }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "200px",
        width: "100%",
      }}
      className={className}
    >
      <Loader2
        size={size}
        style={{
          color: "var(--color-primary)",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
}
