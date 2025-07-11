import React, { useEffect, useRef } from "react";
import { useNotification } from "../services/useNotification";
import NotificacoesList from "./NotificacoesList";
import styles from "./NotificacoesModal.module.css";

interface NotificacoesModalProps {
  onClose: () => void;
}

const NotificacoesModal: React.FC<NotificacoesModalProps> = ({ onClose }) => {
  const { notes, loading } = useNotification();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marcarTodasComoLidas = async () => {
      try {
        await fetch("http://127.0.0.1:5000/notificacoes/ler", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {
        console.error("Erro ao marcar notificações como lidas:", error);
      }
      localStorage.setItem("lastViewedNotifications", notes.length.toString());
    };

    marcarTodasComoLidas();
  }, [notes]);

  // Detectar clique fora do modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={styles["notificacoes-modal"]}>
      <div
        ref={modalRef}
        className={styles["notificacoes-modal-container"]}
      >
        <div className={styles["modal-header"]}>
          <h3 className="montserrat-alternates-semibold">Notificações</h3>
          <button className={styles["close-button"]} onClick={onClose}>✕</button>
        </div>
        <div className={styles["modal-content"]}>
          {loading ? <p>Carregando...</p> : <NotificacoesList notes={notes} />}
        </div>
        <div className={styles["modal-footer"]}>
          <button>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificacoesModal;
