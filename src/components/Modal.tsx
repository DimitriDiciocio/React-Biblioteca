import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  size?: "small" | "large";
}

const Modal: React.FC<ModalProps> = ({ onClose, children, size }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div
        ref={contentRef}
        className={`modal-content ${size || ""}`}
      >
        <a
          className="modal-close pointer text-decoration-none"
          onClick={onClose}
        >
          ✕
        </a>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
};

export default Modal;
