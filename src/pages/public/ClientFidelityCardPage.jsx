import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, Gift, MessageCircle, Search, Share2,
  ShieldCheck, Sparkles, TicketCheck, ArrowLeft, HelpCircle, Award, Car, RotateCw
} from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import Seo from "../../components/ui/Seo";
import { lookupPublicFidelityCards } from "../../services/publicFidelityApi";
import { useSettings } from "../../hooks/useSettings";
import defaultLogo from "../../assets/logo.webp";
import "./ClientFidelityCardPage.css";

const REMEMBERED_FIDELITY_TOKEN = "autoestetica:fidelity-access";

function getRememberedToken() {
  try { return window.localStorage.getItem(REMEMBERED_FIDELITY_TOKEN) || ""; } catch { return ""; }
}

function rememberToken(token) {
  try {
    if (token) window.localStorage.setItem(REMEMBERED_FIDELITY_TOKEN, token);
    else window.localStorage.removeItem(REMEMBERED_FIDELITY_TOKEN);
  } catch { /* El acceso sigue funcionando aunque el navegador bloquee storage. */ }
}

/* ──────────────────────────────────────────────────────────────
   Sub-componente: Tarjeta al estilo crédito (landscape)
────────────────────────────────────────────────────────────── */
function CreditStyleCard({ card, businessName, logoSrc, stampsCount, isUnlocked }) {
  const clientName = (card.client?.name || "").toUpperCase();
  const vehicle = card.vehicle ? card.vehicle.toUpperCase() : null;
  const totalRewards = card.totalRewardsRedeemed || 0;

  return (
    <div className={`cc-card ${isUnlocked ? "cc-card--unlocked" : ""}`} role="img" aria-label={`Tarjeta Fidelity de ${clientName}, ${stampsCount} de 4 sellos`}>
      {/* Capas de fondo decorativas */}
      <div className="cc-bg-layer cc-bg-layer--1" />
      <div className="cc-bg-layer cc-bg-layer--2" />
      <div className="cc-bg-hologram" />

      {/* Fila superior */}
      <div className="cc-row cc-row--top">
        <div className="cc-brand">
          <img
            src={logoSrc}
            alt={businessName}
            className="cc-logo"
            onError={(e) => { e.currentTarget.src = defaultLogo; }}
          />
          <div>
            <span className="cc-brand-name">{businessName}</span>
            <span className="cc-plan-label">Fidelity Pass VIP</span>
          </div>
        </div>
        <div className="cc-chip">
          {isUnlocked ? (
            <span className="cc-chip--reward"><Gift size={14} /> PREMIO LISTO</span>
          ) : (
            <span className="cc-chip--vip"><ShieldCheck size={14} /> CLIENTE VIP</span>
          )}
        </div>
      </div>

      {/* Número decorativo estilo chip */}
      <div className="cc-number-row">
        <span className="cc-dots">●●●●</span>
        <span className="cc-dots">●●●●</span>
        <span className="cc-dots">●●●●</span>
        <span className="cc-card-number-tail">FIDELITY</span>
      </div>

      {/* Sellos (stamps) — zona central prominente */}
      <div className="cc-stamps-zone">
        <span className="cc-stamps-label"><Award size={11} /> TROQUELES ACUMULADOS</span>
        <div className="cc-stamps-track">
          {[0, 1, 2, 3].map((slot) => {
            const done = slot < stampsCount;
            return (
              <div key={slot} className={`cc-stamp ${done ? "cc-stamp--done" : ""}`}>
                {done
                  ? <CheckCircle2 size={24} />
                  : <Circle size={22} />}
                <span className="cc-stamp-label">{slot + 1}</span>
              </div>
            );
          })}
          {/* Ícono regalo del 5° */}
          <div className={`cc-stamp cc-stamp--gift ${isUnlocked ? "cc-stamp--gift-active" : ""}`}>
            <Gift size={22} />
            <span className="cc-stamp-label">GRATIS</span>
          </div>
        </div>
      </div>

      {/* Fila inferior: nombre + vehículo */}
      <div className="cc-row cc-row--bottom">
        <div className="cc-holder-info">
          <span className="cc-holder-label">TITULAR</span>
          <span className="cc-holder-name">{clientName || "–"}</span>
          {vehicle && (
            <span className="cc-vehicle"><Car size={11} /> {vehicle}</span>
          )}
        </div>
        <div className="cc-rewards-count">
          {totalRewards > 0 && (
            <div className="cc-awards-badge">
              <Gift size={12} />
              <span>{totalRewards} {totalRewards === 1 ? "premio" : "premios"} canjeado{totalRewards !== 1 ? "s" : ""}</span>
            </div>
          )}
          <span className="cc-progress-fraction">{stampsCount}<span>/4</span></span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="cc-progress-bar-wrap">
        <div className="cc-progress-bar-fill" style={{ width: `${(stampsCount / 4) * 100}%` }} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Página principal
────────────────────────────────────────────────────────────── */
export function PuzzleFidelityCard({ card, businessName, logoSrc, stampsCount, isUnlocked }) {
  const [showBack, setShowBack] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationComplete, setCelebrationComplete] = useState(false);
  const celebrationTimer = useRef(null);
  const completionTimer = useRef(null);
  const clientName = (card.client?.name || "").toUpperCase();
  const vehicleValue = typeof card.vehicle === "string"
    ? card.vehicle
    : [card.vehicle?.brand, card.vehicle?.model].filter(Boolean).join(" ") || card.vehicle?.type;
  const vehicle = (vehicleValue || "Tu vehículo").toUpperCase();
  const vehicleType = (card.vehicleType || "Vehiculo").toUpperCase();
  const licensePlate = card.licensePlate?.toUpperCase() || null;
  const activatedYear = card.activatedAt ? new Date(card.activatedAt).getFullYear() : null;
  const puzzlePieces = [
    "M0 0H500V105C500 128 535 120 558 128C625 151 625 244 558 267C535 275 500 267 500 290V315H365C342 315 350 350 342 373C319 440 226 440 203 373C195 350 203 315 180 315H0Z",
    "M500 0H1000V315H820C797 315 805 350 797 373C774 440 681 440 658 373C650 350 658 315 635 315H500V290C500 267 535 275 558 267C625 244 625 151 558 128C535 120 500 128 500 105Z",
    "M0 315H180C203 315 195 350 203 373C226 440 319 440 342 373C350 350 342 315 365 315H500V420C500 443 465 435 442 443C375 466 375 559 442 582C465 590 500 582 500 605V630H0Z",
    "M500 315H635C658 315 650 350 658 373C681 440 774 440 797 373C805 350 797 315 820 315H1000V630H500V605C500 582 465 590 442 582C375 559 375 466 442 443C465 435 500 443 500 420Z",
  ];
  const pieceFlight = [
    { x: -132, y: -92, orbitX: 118, orbitY: -112, r: -14 },
    { x: 132, y: -92, orbitX: 128, orbitY: 104, r: 15 },
    { x: -132, y: 96, orbitX: -118, orbitY: -108, r: 13 },
    { x: 132, y: 96, orbitX: -128, orbitY: 106, r: -15 },
  ];

  useEffect(() => () => {
    clearTimeout(celebrationTimer.current);
    clearTimeout(completionTimer.current);
  }, []);

  function handleFlip() {
    clearTimeout(celebrationTimer.current);
    clearTimeout(completionTimer.current);
    setIsCelebrating(false);
    setCelebrationComplete(false);
    if (showBack) {
      setShowBack(false);
      return;
    }
    setShowBack(true);
    if (isUnlocked) celebrationTimer.current = setTimeout(() => {
      setIsCelebrating(true);
      completionTimer.current = setTimeout(() => {
        setIsCelebrating(false);
        setCelebrationComplete(true);
      }, 3400);
    }, 760);
  }

  return (
    <div className="cc-card-stage">
      <button type="button" className="cc-flip-button" onClick={handleFlip}>
        <RotateCw size={14} /> {showBack ? "Ver frente" : "Ver troqueles"}
      </button>
      <div
        className={`cc-card-flipper ${showBack ? "is-flipped" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={showBack ? "Ver el frente de la tarjeta" : "Ver los troqueles de la tarjeta"}
        onClick={handleFlip}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleFlip();
          }
        }}
      >
        <article className={`cc-card cc-card--front ${isUnlocked ? "cc-card--unlocked" : ""}`} aria-label={`Frente de la tarjeta Fidelity de ${clientName}`}>
          <div className="cc-bg-layer cc-bg-layer--1" />
          <div className="cc-bg-layer cc-bg-layer--2" />
          <div className="cc-bg-hologram" />
          <img src={logoSrc} alt="" className="cc-logo-watermark" onError={(event) => { event.currentTarget.src = defaultLogo; }} />
          <div className="cc-front-identity-meta" aria-label="Identidad del vehiculo">
            <span><small>CLASE</small><strong>{vehicleType}</strong></span>
            {licensePlate ? <span className="cc-front-plate"><small>PATENTE</small><strong>{licensePlate}</strong></span> : null}
            {activatedYear ? <span><small>SOCIO DESDE</small><strong>{activatedYear}</strong></span> : null}
          </div>
          <div className="cc-row cc-row--top">
            <div className="cc-brand"><img src={logoSrc} alt={businessName} className="cc-logo" onError={(event) => { event.currentTarget.src = defaultLogo; }} /><div><span className="cc-brand-name">{businessName}</span><span className="cc-plan-label">Fidelity Pass</span></div></div>
            <div className="cc-chip">{isUnlocked ? <span className="cc-chip--reward"><Gift size={14} /> PREMIO LISTO</span> : <span className="cc-chip--vip"><ShieldCheck size={14} /> CLIENTE VIP</span>}</div>
          </div>
          <div className="cc-credit-center">
            <div className="cc-metal-chip" aria-hidden="true"><i /><i /><i /></div>
            <div className="cc-front-vehicle"><span>VEHÍCULO REGISTRADO</span><strong>{vehicle}</strong></div>
          </div>
          <div className="cc-row cc-row--bottom"><div className="cc-holder-info"><span className="cc-holder-label">TITULAR</span><span className="cc-holder-name cc-embossed">{clientName || "—"}</span></div><span className="cc-front-pass cc-embossed">AUTOESTÉTICA<br />TUCUMÁN</span></div>
        </article>

        <article className={`cc-card cc-card--back ${isUnlocked ? "cc-card--unlocked" : ""} ${isCelebrating ? "is-celebrating" : ""} ${celebrationComplete ? "is-revealed" : ""}`} aria-label={`Reverso de la tarjeta, ${stampsCount} de 4 piezas`}>
          <div className={`cc-puzzle ${isUnlocked ? "is-complete" : ""}`}>
            <svg className="cc-puzzle-svg" viewBox="0 0 1000 630" preserveAspectRatio="none" role="img" aria-label={`${stampsCount} de 4 piezas completadas`}>
              <defs>
                <linearGradient id="cc-puzzle-pending" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0e1c2d" stopOpacity=".86" />
                  <stop offset=".48" stopColor="#06101d" stopOpacity=".76" />
                  <stop offset="1" stopColor="#020813" stopOpacity=".92" />
                </linearGradient>
                <linearGradient id="cc-puzzle-edge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e0f2fe" stopOpacity=".82" />
                  <stop offset=".45" stopColor="#38bdf8" stopOpacity=".5" />
                  <stop offset="1" stopColor="#020617" stopOpacity=".9" />
                </linearGradient>
                <pattern id="cc-puzzle-texture" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
                  <rect width="18" height="18" fill="transparent" />
                  <path d="M0 2H18M0 11H18" stroke="#bae6fd" strokeOpacity=".045" strokeWidth="1" />
                </pattern>
              </defs>
              <motion.image
                className="cc-puzzle-logo-image"
                href={logoSrc}
                x="205" y="20" width="590" height="590"
                preserveAspectRatio="xMidYMid slice"
                animate={isCelebrating ? { opacity: [1, .12, .12, 1, 1], scale: [1, .72, .72, 1.12, 1], rotate: [0, -6, -6, 2, 0] } : { opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 3.6, times: [0, .14, .62, .82, 1], ease: "easeInOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              {puzzlePieces.map((path, slot) => (
                <motion.g
                  key={path}
                  className={`cc-svg-piece ${slot < stampsCount ? "is-earned" : ""}`}
                  animate={isCelebrating ? {
                    x: [0, pieceFlight[slot].x, pieceFlight[slot].orbitX, -pieceFlight[slot].x * .72, 0, 0],
                    y: [0, pieceFlight[slot].y, pieceFlight[slot].orbitY, -pieceFlight[slot].y * .68, 0, 0],
                    rotate: [0, pieceFlight[slot].r, pieceFlight[slot].r + 34, pieceFlight[slot].r - 26, 0, 0],
                    scale: [1, 1.23, 1.14, 1.2, .94, 1],
                    filter: ["brightness(1)", "brightness(1.5) drop-shadow(0 22px 18px rgba(0,0,0,.8))", "brightness(1.85) drop-shadow(0 0 20px #38bdf8)", "brightness(1.65) drop-shadow(0 0 18px #a78bfa)", "brightness(2.8) drop-shadow(0 0 30px #facc15)", "brightness(1)"],
                  } : { x: 0, y: 0, rotate: 0, scale: 1, filter: "brightness(1)" }}
                  transition={{ duration: 3.15, delay: slot * .06, times: [0, .2, .43, .64, .84, 1], ease: [0.22, 0.75, 0.2, 1] }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  <path className="cc-svg-piece-cover" d={path} />
                  <path className="cc-svg-piece-texture" d={path} />
                  <path className="cc-svg-piece-bevel" d={path} />
                  <path className="cc-svg-piece-cut" d={path} />
                </motion.g>
              ))}
            </svg>
          </div>
          {isUnlocked ? <div className="cc-reward-cinematic" aria-hidden="true">
            <div className="cc-reward-vignette" />
            <div className="cc-reward-portal"><i /><i /><i /></div>
            <div className="cc-reward-flash" />
            <div className="cc-reward-rays" />
            <div className="cc-reward-shockwaves"><i /><i /><i /></div>
            <div className="cc-reward-sparks">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ "--a": `${index * 12.86}deg`, "--d": `${105 + (index % 7) * 18}px`, "--s": `${3 + (index % 4) * 2}px`, "--delay": `${(index % 5) * .025}s` }} />)}</div>
            <div className="cc-reward-confetti">{Array.from({ length: 42 }, (_, index) => <i key={index} style={{ "--x": `${4 + ((index * 43) % 92)}%`, "--delay": `${(index % 9) * .055}s`, "--fall": `${185 + (index % 6) * 34}px`, "--drift": `${-55 + (index % 8) * 16}px` }} />)}</div>
            <motion.div className="cc-reward-emblem" initial={false} animate={celebrationComplete ? { opacity: [0, 1, 1, 1], scale: [.18, 1.42, .88, 1], rotateY: [-70, 14, -5, 0] } : { opacity: 0, scale: .18, rotateY: -70 }} transition={{ duration: 1.72, times: [0, .42, .7, 1], ease: [0.16, .86, .18, 1] }}>
              <span className="cc-reward-emblem-glow" />
              <span className="cc-reward-emblem-face"><img src={logoSrc} alt="" onError={(event) => { event.currentTarget.src = defaultLogo; }} /><i /></span>
              <span className="cc-reward-crown"><i /><i /><i /><i /><i /></span>
            </motion.div>
            <div className="cc-reward-copy"><small>FIDELITY PASS</small><strong>¡PREMIO DESBLOQUEADO!</strong><span>LAVADO PREMIUM</span></div>
          </div> : null}
          {isUnlocked ? (
            <motion.div
              className="cc-automotive-logo-reveal"
              aria-hidden="true"
              initial={false}
              animate={celebrationComplete ? {
                opacity: [0, 1, 1, 1],
                scale: [.48, 1.34, .94, 1],
                rotateX: [18, -7, 3, 0],
                rotateY: [-34, 10, -4, 0],
                z: [-160, 90, -18, 0],
              } : { opacity: 0, scale: .48, rotateX: 18, rotateY: -34, z: -160 }}
              transition={{ duration: 2.05, times: [0, .43, .72, 1], ease: [0.16, 0.82, 0.2, 1] }}
            >
              <span className="cc-award-rays" />
              <span className="cc-award-orbit"><i /><i /><i /><i /><i /><i /><i /><i /></span>
              <span className="cc-automotive-logo-halo" />
              <span className="cc-automotive-logo-seal">
                <img src={logoSrc} alt="" onError={(event) => { event.currentTarget.src = defaultLogo; }} />
                <motion.i
                  className="cc-automotive-logo-shine"
                  animate={celebrationComplete ? { x: ["-180%", "185%"], opacity: [0, 1, 0] } : { x: "-180%", opacity: 0 }}
                  transition={{ duration: .78, delay: .46, times: [0, .48, 1], ease: "easeInOut" }}
                />
              </span>
              <motion.i
                className="cc-automotive-logo-glint"
                animate={celebrationComplete ? { opacity: [0, 1, 0], scale: [.15, 1.45, .2], rotate: [0, 90, 180] } : { opacity: 0, scale: .15 }}
                transition={{ duration: .72, delay: 1.02, ease: "easeOut" }}
              />
              <span className="cc-award-title"><b>PREMIO</b><small>DESBLOQUEADO</small></span>
            </motion.div>
          ) : null}
          {isUnlocked ? <div className="cc-cinematic-fx" aria-hidden="true">
            <motion.i className="cc-energy-core" animate={isCelebrating ? { opacity: [0, 0, 1, 1, 0], scale: [.1, .1, 1, 1.7, 0] } : { opacity: 0 }} transition={{ duration: 3.35, times: [0, .18, .42, .76, 1] }} />
            {[0, 1, 2].map((ring) => <motion.i key={ring} className={`cc-energy-ring ring-${ring + 1}`} animate={isCelebrating ? { opacity: [0, 0, .9, .55, 0], scale: [.15, .15, 1, 1.9 + ring * .25, 2.3] } : { opacity: 0 }} transition={{ duration: 3.35, delay: ring * .08, times: [0, .35, .55, .82, 1] }} />)}
            <motion.i className="cc-fusion-flash" animate={isCelebrating ? { opacity: [0, 0, 0, 1, 0], scale: [.1, .1, .1, 1.35, 2.4] } : { opacity: 0 }} transition={{ duration: 3.45, times: [0, .65, .78, .84, 1] }} />
            <motion.i className="cc-holo-sweep" animate={isCelebrating ? { opacity: [0, 0, .9, 0], x: ["-140%", "-140%", "130%", "150%"] } : { opacity: 0, x: "-140%" }} transition={{ duration: 3.9, times: [0, .7, .9, 1] }} />
          </div> : null}
          {isUnlocked ? <div className="cc-final-impact" aria-hidden="true">
            <i className="cc-final-shockwave" />
            <div className="cc-dust-cloud">{Array.from({ length: 30 }, (_, index) => <i key={index} style={{ "--dust-angle": `${index * 12}deg`, "--dust-distance": `${70 + (index % 7) * 17}px`, "--dust-size": `${5 + (index % 5) * 3}px`, "--dust-delay": `${(index % 6) * .035}s` }} />)}</div>
          </div> : null}
          {isUnlocked ? <div className="cc-completion-burst" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--particle": index, "--particle-delay": `${(index % 6) * 0.045}s`, "--particle-distance": `${120 + (index % 5) * 16}px` }} />)}</div> : null}
          {isUnlocked ? <div className="cc-star-rain" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ "--star-x": `${3 + ((index * 37) % 94)}%`, "--star-delay": `${3 + (index % 8) * 0.09}s`, "--star-duration": `${0.85 + (index % 5) * 0.13}s`, "--star-size": `${5 + (index % 4) * 2}px` }} />)}</div> : null}
        </article>
      </div>
    </div>
  );
}

export default function ClientFidelityCardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const phoneParam = searchParams.get("phone") || searchParams.get("telefono") || "";

  const [phoneInput, setPhoneInput] = useState(phoneParam);
  const [accessCode, setAccessCode] = useState("");
  const [accessToken, setAccessToken] = useState(() => tokenParam || getRememberedToken());
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(accessToken));
  const [searched, setSearched] = useState(Boolean(accessToken));
  const [searchError, setSearchError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const { settings } = useSettings();

  const logoSrc = settings?.logoUrl || defaultLogo;
  const businessName = settings?.businessName || "Autoestética Tucumán";

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!accessToken) { setIsLoading(false); return; }
      setIsLoading(true);
      setSearched(true);
      try {
        const result = await lookupPublicFidelityCards({ token: accessToken });
        if (isMounted) {
          setCards(result);
          setSelectedCardId(result[0]?.id || null);
          if (result.length) rememberToken(accessToken);
          else if (!tokenParam) rememberToken("");
        }
      } catch (err) {
        console.error("Error buscando tarjeta fidelity:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [accessToken, tokenParam]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const normalizedPhone = phoneInput.replace(/\D/g, "");
    if (!/^381\d{7}$/.test(normalizedPhone)) {
      setSearchError("Ingresá 10 dígitos comenzando con 381. Ejemplo: 3814000000.");
      return;
    }
    if (!/^[a-fA-F0-9]{8}$/.test(accessCode)) {
      setSearchError("Ingresá el código de 8 caracteres que recibiste por WhatsApp.");
      return;
    }
    setIsLoading(true);
    setSearched(true);
    setSearchError("");
    try {
      const result = await lookupPublicFidelityCards({ phone: normalizedPhone, accessCode });
      setCards(result);
      setSelectedCardId(result[0]?.id || null);
      if (result[0]?.publicToken) rememberToken(result[0].publicToken);
    } catch (err) {
      console.error(err);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const card = cards.find((item) => item.id === selectedCardId) || cards[0] || null;

  function forgetAccess() {
    rememberToken("");
    setAccessToken("");
    if (tokenParam) setSearchParams({}, { replace: true });
    setCards([]);
    setSelectedCardId(null);
    setSearched(false);
    setPhoneInput("");
    setAccessCode("");
    setSearchError("");
  }

  async function shareReward() {
    const shareUrl = `${window.location.origin}/tarjeta?token=${encodeURIComponent(card.publicToken || accessToken)}`;
    const shareData = { title: "Mi Fidelity Pass", text: `Mi Fidelity Pass de ${businessName}`, url: shareUrl };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("Enlace copiado");
        window.setTimeout(() => setShareMessage(""), 2200);
      }
    } catch (error) {
      if (error?.name !== "AbortError") setShareMessage("No pudimos compartir el enlace");
    }
  }

  const whatsappNumber = (settings?.whatsapp || "5493815448147").replace(/\D/g, "");
  const stampsCount = card?.stampsCount || 0;
  const isUnlocked = card?.status === "reward_ready" || stampsCount >= 4;

  const whatsAppLink = () => {
    const text = isUnlocked
      ? `¡Hola! Ya completé mis 4 troqueles en la Tarjeta Fidelity Pass de ${businessName} 🎁 Quiero agendar mi turno para usar mi 5° LAVADO PREMIUM GRATIS.`
      : `¡Hola ${businessName}! Quiero pedir turno. Mi Tarjeta Fidelity tiene ${stampsCount} de 4 troqueles.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <PublicLayout>
      <Seo
        title={`Tarjeta Fidelity Digital · ${businessName}`}
        description="Consultá tus troqueles y el avance de tu 5° Lavado Gratis en Autoestética Tucumán."
      />
      <PageTransition>
        <div className="fidelity-page-shell">
          <div className="container">

            {!card ? <header className="fidelity-page-header fidelity-access-header">
              <Link to="/" className="fidelity-back-link">
                <ArrowLeft size={16} /> Volver al inicio
              </Link>
              <img className="fidelity-access-logo" src={logoSrc} alt={`Logo de ${businessName}`} onError={(event) => { event.currentTarget.src = defaultLogo; }} />
              <strong className="fidelity-access-business">{businessName}</strong>
              <span className="fidelity-public-badge">
                <Sparkles size={14} /> Fidelity Pass VIP
              </span>
              <h1>Ingresá a tu tarjeta</h1>
              <p>Ingresá el teléfono registrado y el código privado que recibiste por WhatsApp.</p>
            </header> : null}

            {/* Buscador */}
            {!card && !tokenParam && (
              <form onSubmit={handleSearch} className="fidelity-search-box">
                <label htmlFor="phone-input"><Search size={15} /> Ingresá tu teléfono:</label>
                <div className="fidelity-search-input-group">
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="Ej: 3814000000"
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10)); setSearchError(""); }}
                    required
                  />
                </div>
                <label htmlFor="access-code-input">Código privado:</label>
                <input
                  className="fidelity-access-code-input"
                  id="access-code-input"
                  type="text"
                  inputMode="text"
                  autoComplete="one-time-code"
                  placeholder="Ej: A1B2C3D4"
                  value={accessCode}
                  onChange={(e) => { setAccessCode(e.target.value.replace(/[^a-fA-F0-9]/g, "").toUpperCase().slice(0, 8)); setSearchError(""); }}
                  required
                />
                <button type="submit" className="fidelity-access-submit" disabled={isLoading}>{isLoading ? "Ingresando…" : "Entrar"}</button>
                <small>Sin 0, sin 15, sin +54. Ejemplo: 3814000000.</small>
                {searchError && <p className="fidelity-search-error" role="alert">{searchError}</p>}
              </form>
            )}

            {/* Estados */}
            {isLoading ? (
              <div className="fidelity-card-loading-box">
                <TicketCheck size={32} className="fidelity-pulse" />
                <span>Cargando tu tarjeta VIP...</span>
              </div>
            ) : searched && !card ? (
              <div className="fidelity-not-found-box">
                <TicketCheck size={36} />
                <h3>No pudimos abrir la tarjeta</h3>
                <p>Revisá el teléfono y el código privado del mensaje de WhatsApp, o pedinos un nuevo enlace.</p>
                <a href={whatsAppLink()} target="_blank" rel="noreferrer" className="fidelity-cta">
                  <MessageCircle size={18} /> Consultar por WhatsApp
                </a>
              </div>
            ) : card ? (
              <div className="fidelity-main-wrapper">

                <header className="fidelity-client-welcome">
                  <img src={logoSrc} alt={`Logo de ${businessName}`} onError={(event) => { event.currentTarget.src = defaultLogo; }} />
                  <div><span>{businessName}</span><h1>Bienvenido, {card.client?.name || card.clientName}</h1><p>Tu acceso quedÃ³ guardado de forma segura en este dispositivo.</p></div>
                  <button type="button" className="fidelity-forget-access" onClick={forgetAccess}>Cambiar cliente</button>
                </header>

                {cards.length > 1 ? (
                  <nav className="fidelity-vehicle-switcher fidelity-garage" aria-label="Elegir tarjeta por vehiculo">
                    <header><div><span>Garage Fidelity</span><strong>Tus vehiculos</strong></div><small>{cards.length} tarjetas activas</small></header>
                    <span>ElegÃ­ tu vehÃ­culo</span>
                    <div>
                      {cards.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={item.id === card.id ? "is-active" : ""}
                          onClick={() => setSelectedCardId(item.id)}
                          aria-pressed={item.id === card.id}
                        >
                          <Car size={16} />
                          <strong>{item.vehicle || "VehÃ­culo"}</strong>
                          <small>{item.stampsCount}/4 troqueles</small>
                        </button>
                      ))}
                    </div>
                  </nav>
                ) : null}

                {/* ── Tarjeta estilo crédito ── */}
                <section className="fidelity-card-focus" aria-label="Tu tarjeta Fidelity">
                  <div className="fidelity-card-focus-heading">
                    <div>
                      <span>Tu Fidelity Pass</span>
                      <strong>{card.vehicle || "Vehiculo registrado"}</strong>
                    </div>
                    <small className={isUnlocked ? "is-reward" : ""}>
                      {isUnlocked ? "Premio disponible" : `${stampsCount} de 4 troqueles`}
                    </small>
                  </div>
                  <PuzzleFidelityCard
                    card={card}
                    businessName={businessName}
                    logoSrc={logoSrc}
                    stampsCount={stampsCount}
                    isUnlocked={isUnlocked}
                  />
                  <p className="fidelity-card-hint"><RotateCw size={14} /> Toca la tarjeta para ver el reverso</p>
                </section>

                <section className={`fidelity-progress-panel${isUnlocked ? " is-complete" : ""}`} aria-label="Progreso hacia tu premio">
                  <div className="fidelity-progress-copy">
                    <span>{isUnlocked ? <Gift size={16} /> : <Award size={16} />}{isUnlocked ? "Beneficio desbloqueado" : "Camino al premio"}</span>
                    <strong>
                      {isUnlocked
                        ? "Tu proximo Lavado Premium es gratis"
                        : `Te ${4 - stampsCount === 1 ? "falta" : "faltan"} ${4 - stampsCount} ${4 - stampsCount === 1 ? "visita" : "visitas"}`}
                    </strong>
                    <p>{isUnlocked ? "Ya podes coordinar el turno para canjearlo." : "Cada trabajo finalizado suma una nueva pieza a tu tarjeta."}</p>
                  </div>
                  <div className="fidelity-progress-journey" style={{ "--fidelity-progress": `${stampsCount <= 1 ? 0 : Math.min(((stampsCount - 1) / 3) * 100, 100)}%` }}>
                    <div className="fidelity-progress-track"><i /></div>
                    <div className="fidelity-progress-milestones">
                      {[1, 2, 3, 4].map((step) => (
                        <span key={step} className={step <= stampsCount ? "is-done" : ""}>
                          <b>{step <= stampsCount ? <CheckCircle2 size={15} /> : step}</b>
                          <small>{step === 4 ? "Premio" : `Visita ${step}`}</small>
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {isUnlocked ? (
                  <section className="fidelity-reward-pass" aria-label="Premio Fidelity desbloqueado">
                    <div className="fidelity-reward-pass-glow" aria-hidden="true" />
                    <header>
                      <span><Gift size={16} /> Reward Pass</span>
                      <small>Beneficio disponible</small>
                    </header>
                    <div className="fidelity-reward-pass-main">
                      <div className="fidelity-reward-seal"><img src={logoSrc} alt="" /><i /></div>
                      <div>
                        <small>Premio desbloqueado para</small>
                        <strong>{card.vehicle || "Vehiculo registrado"}</strong>
                        {card.licensePlate ? <span>{card.licensePlate}</span> : null}
                      </div>
                    </div>
                    <div className="fidelity-reward-code">
                      <span><small>CODIGO DE CANJE</small><strong>{`AT-${String(card.publicToken || card.id || "FIDELITY").replaceAll("-", "").slice(0, 8).toUpperCase()}`}</strong></span>
                      <em>5to Lavado Premium</em>
                    </div>
                    <button type="button" className="fidelity-reward-share" onClick={shareReward}><Share2 size={16} /> {shareMessage || "Compartir mi tarjeta"}</button>
                  </section>
                ) : null}

                {/* Banner de premio */}
                {isUnlocked && (
                  <div className="fidelity-reward-alert">
                    <Gift size={28} className="reward-gift-icon" />
                    <div>
                      <strong>🎉 ¡COMPLETASTE LOS 4 SELLOS! 5° Lavado Gratis listo</strong>
                      <p>Agendá tu turno por WhatsApp para canjear tu regalo.</p>
                    </div>
                  </div>
                )}

                {/* CTA WhatsApp */}
                <a href={whatsAppLink()} target="_blank" rel="noreferrer" className={`fidelity-cta${isUnlocked ? " is-reward" : ""}`}>
                  <MessageCircle size={18} />
                  {isUnlocked ? "🎁 Canjear mi 5° Lavado Gratis" : "Pedir turno por WhatsApp"}
                </a>

                {/* Explicación */}
                <section className="fidelity-explanation-card">
                  <h3><HelpCircle size={18} /> ¿Cómo funciona?</h3>
                  <div className="fidelity-steps-grid">
                    {[
                      { n: 1, title: "Completá un servicio", desc: `Al retirar tu vehículo terminado en ${businessName}, te sumamos 1 sello automáticamente.` },
                      { n: 2, title: "Acumulá 4 troqueles", desc: "En cada visita sumas 1 sello a tu tarjeta digital. Podés consultarla cuando quieras desde este enlace." },
                      { n: 3, title: "¡5° Lavado 100% Gratis!", desc: `Al completar 4 sellos, tu próximo Lavado Premium en ${businessName} es completamente gratis.` },
                    ].map(({ n, title, desc }) => (
                      <div key={n} className="fidelity-step-item">
                        <div className="fidelity-step-num">{n}</div>
                        <div>
                          <strong>{title}</strong>
                          <p>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </PageTransition>
    </PublicLayout>
  );
}
