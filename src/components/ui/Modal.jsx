import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import "./Modal.css";

const MODAL_WIDTH_CLASS = {
  "780px": "modal-width-compact",
  "900px": "modal-width-wide",
  "1000px": "modal-width-xl",
};

function Modal({ isOpen, onClose, title, children, maxWidth = "800px" }) {
  const widthClass = MODAL_WIDTH_CLASS[maxWidth] || "modal-width-default";

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="modal-overlay">
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className={`modal-container ${widthClass}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <button type="button" className="modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export default Modal;
