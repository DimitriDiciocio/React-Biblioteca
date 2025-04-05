import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  size?: "small" | "large"; // Optional size prop
}

const Modal: React.FC<ModalProps> = ({ onClose, children, size }) => {
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${size || ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          X
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
};

export default Modal;
