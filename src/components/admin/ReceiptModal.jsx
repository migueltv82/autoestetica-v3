import { useMemo, useState } from "react";
import { Download, FileText, MessageCircle, Plus, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import logoUrl from "../../assets/logo.jpg";
import "./ReceiptModal.css";

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("54")) return digits;
  const local = digits.replace(/^0/, "").replace(/^15/, "");
  return `549${local}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let currentY = y;
  words.forEach((word) => {
    const testLine = `${line}${word} `;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });
  context.fillText(line.trim(), x, currentY);
  return currentY;
}

function ReceiptModal({ turn, services, settings, onClose }) {
  const matchedService = services.find(
    (service) => service.name.toLowerCase() === (turn?.service || "").toLowerCase()
  );
  const [items, setItems] = useState(() => [{
    id: Date.now(),
    description: turn.service || "Servicio de detailing",
    quantity: 1,
    price: Number(turn.amount) || Number(matchedService?.price) || 0,
  }]);
  const [receiptNumber, setReceiptNumber] = useState(() => `R-${String(turn.id).slice(-6)}`);
  const [isWorking, setIsWorking] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0),
    [items]
  );

  function updateItem(id, field, value) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems((current) => [...current, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  }

  async function createReceiptFile() {
    const width = 1080;
    const rowHeight = 84;
    const height = 760 + Math.max(items.length, 1) * rowHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f7f7f4";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, width, 210);
    ctx.fillStyle = "#d4d4d0";
    ctx.fillRect(0, 205, width, 5);

    try {
      const logo = await loadImage(logoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(105, 105, 66, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, 39, 39, 132, 132);
      ctx.restore();
    } catch {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px Arial";
      ctx.fillText("AE", 55, 122);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px Arial";
    ctx.fillText(settings.businessName || "Autoestética Tucumán", 205, 92);
    ctx.fillStyle = "#b8b8b3";
    ctx.font = "24px Arial";
    ctx.fillText("DETAILING AUTOMOTRIZ", 205, 132);
    ctx.fillText(settings.address || "Tucumán, Argentina", 205, 168);

    ctx.fillStyle = "#111111";
    ctx.font = "bold 34px Arial";
    ctx.fillText("RECIBO DE SERVICIOS", 64, 276);
    ctx.textAlign = "right";
    ctx.font = "bold 26px Arial";
    ctx.fillText(receiptNumber, width - 64, 270);
    ctx.fillStyle = "#666660";
    ctx.font = "22px Arial";
    ctx.fillText(new Date().toLocaleDateString("es-AR"), width - 64, 304);
    ctx.textAlign = "left";

    ctx.fillStyle = "#e9e9e5";
    ctx.fillRect(64, 340, width - 128, 130);
    ctx.fillStyle = "#666660";
    ctx.font = "bold 19px Arial";
    ctx.fillText("CLIENTE", 88, 378);
    ctx.fillText("VEHÍCULO", 560, 378);
    ctx.fillStyle = "#111111";
    ctx.font = "bold 27px Arial";
    ctx.fillText(turn.client, 88, 417);
    ctx.fillText(turn.vehicle || "—", 560, 417);
    ctx.fillStyle = "#666660";
    ctx.font = "21px Arial";
    ctx.fillText(turn.phone || "", 88, 450);

    let y = 525;
    ctx.fillStyle = "#111111";
    ctx.font = "bold 20px Arial";
    ctx.fillText("DETALLE", 64, y);
    ctx.textAlign = "center";
    ctx.fillText("CANT.", 700, y);
    ctx.textAlign = "right";
    ctx.fillText("PRECIO", 850, y);
    ctx.fillText("SUBTOTAL", width - 64, y);
    ctx.strokeStyle = "#ccccC7";
    ctx.beginPath(); ctx.moveTo(64, y + 20); ctx.lineTo(width - 64, y + 20); ctx.stroke();

    y += 68;
    items.forEach((item) => {
      ctx.fillStyle = "#222222";
      ctx.font = "23px Arial";
      ctx.textAlign = "left";
      wrapText(ctx, item.description || "Servicio", 64, y, 520, 27);
      ctx.textAlign = "center";
      ctx.fillText(String(item.quantity || 0), 700, y);
      ctx.textAlign = "right";
      ctx.fillText(money.format(Number(item.price || 0)), 850, y);
      ctx.font = "bold 23px Arial";
      ctx.fillText(money.format(Number(item.quantity || 0) * Number(item.price || 0)), width - 64, y);
      ctx.strokeStyle = "#e0e0dc";
      ctx.beginPath(); ctx.moveTo(64, y + 35); ctx.lineTo(width - 64, y + 35); ctx.stroke();
      y += rowHeight;
    });

    y += 20;
    ctx.fillStyle = "#111111";
    ctx.fillRect(560, y, width - 624, 90);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "bold 22px Arial";
    ctx.fillText("TOTAL", 590, y + 55);
    ctx.textAlign = "right";
    ctx.font = "bold 32px Arial";
    ctx.fillText(money.format(total), width - 88, y + 58);

    ctx.textAlign = "center";
    ctx.fillStyle = "#666660";
    ctx.font = "20px Arial";
    ctx.fillText("Gracias por confiar en nuestro trabajo.", width / 2, height - 85);
    ctx.font = "18px Arial";
    ctx.fillText(settings.whatsapp || "Autoestética Tucumán", width / 2, height - 50);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
    return new File([blob], `recibo-${receiptNumber}.png`, { type: "image/png" });
  }

  function downloadFile(file) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleDownload() {
    if (!items.length || total <= 0) return;
    setIsWorking(true);
    try { downloadFile(await createReceiptFile()); } finally { setIsWorking(false); }
  }

  async function handleWhatsApp() {
    if (!items.length || total <= 0) return;
    setIsWorking(true);
    try {
      const file = await createReceiptFile();
      const text = `Hola ${turn.client}, te enviamos el recibo ${receiptNumber} de ${settings.businessName || "Autoestética Tucumán"}. Total: ${money.format(total)}. ¡Gracias por elegirnos!`;
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `Recibo ${receiptNumber}`, text, files: [file] });
      } else {
        downloadFile(file);
        const phone = normalizePhone(turn.phone);
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`${text}\n\nEl recibo fue descargado para adjuntarlo en este chat.`)}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      if (error?.name !== "AbortError") alert("No se pudo generar el recibo. Intentá nuevamente.");
    } finally { setIsWorking(false); }
  }

  return (
    <Modal isOpen={Boolean(turn)} onClose={onClose} title="Generar recibo" maxWidth="900px">
      <div className="receipt-editor">
        <div className="receipt-summary">
          <div className="receipt-brand"><img src={logoUrl} alt="Logo" /><span><strong>{settings.businessName || "Autoestética Tucumán"}</strong><small>Recibo de servicios</small></span></div>
          <label>N.º de recibo<input value={receiptNumber} onChange={(event) => setReceiptNumber(event.target.value)} /></label>
        </div>
        <div className="receipt-client-grid">
          <span><small>Cliente</small><strong>{turn.client}</strong></span>
          <span><small>WhatsApp</small><strong>{turn.phone}</strong></span>
          <span><small>Vehículo</small><strong>{turn.vehicle}</strong></span>
        </div>
        <div className="receipt-items-heading"><div><strong>Servicios realizados</strong><small>Podés ajustar el detalle antes de emitirlo.</small></div><button type="button" onClick={addItem}><Plus size={16} /> Agregar servicio</button></div>
        <div className="receipt-items">
          {items.map((item) => (
            <div className="receipt-item" key={item.id}>
              <label className="receipt-description">Detalle<input value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} placeholder="Servicio realizado" /></label>
              <label>Cantidad<input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} /></label>
              <label>Precio unitario<input type="number" min="0" value={item.price} onChange={(event) => updateItem(item.id, "price", event.target.value)} /></label>
              <button type="button" className="receipt-remove" onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))} title="Quitar"><Trash2 size={17} /></button>
            </div>
          ))}
        </div>
        <div className="receipt-total"><span>Total a pagar</span><strong>{money.format(total)}</strong></div>
        {total <= 0 ? <p className="receipt-warning">Ingresá el precio de al menos un servicio para generar el recibo.</p> : null}
        <div className="receipt-actions">
          <button type="button" className="receipt-download" onClick={handleDownload} disabled={isWorking || total <= 0}><Download size={18} /> Descargar PNG</button>
          <button type="button" className="receipt-whatsapp" onClick={handleWhatsApp} disabled={isWorking || total <= 0}><MessageCircle size={18} /> {isWorking ? "Generando…" : "Enviar por WhatsApp"}</button>
        </div>
        <p className="receipt-help"><FileText size={14} /> El recibo se genera como imagen para que sea fácil de visualizar y compartir.</p>
      </div>
    </Modal>
  );
}

export default ReceiptModal;
