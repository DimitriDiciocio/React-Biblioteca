import React, { useEffect } from "react";
import { useNotification } from "../services/useNotification";
import { io } from "socket.io-client";
import NotificacoesList from "./NotificacoesList";
import styles from "./NotificacoesModal.module.css";

const socket = io("http://127.0.0.1:5000");

interface NotificacoesModalProps {
  onClose: () => void;
}

const NotificacoesModal: React.FC<NotificacoesModalProps> = ({ onClose }) => {
  const { notes, loading } = useNotification();

  useEffect(() => {
    socket.emit("notificacoesVisualizadas"); // Notify backend that notifications were viewed
    if (notes) {
      localStorage.setItem("lastViewedNotifications", notes.length.toString()); // Update last viewed notifications count
    }

    return () => {
      // Ensure the socket is not disconnected globally if used elsewhere
      socket.off("notificacoesVisualizadas");
    };
  }, [notes]);

  return (
    <div className={`${styles["notificacoes-modal"]} ${styles["notificacoes-modal-container"]}`}>
      <div className={styles["modal-header"]}>
        <h3>Notificações</h3>
        <button className={styles["close-button"]} onClick={onClose}>✕</button>
      </div>
      <div className={styles["modal-content"]}>
        {loading ? <p>Carregando...</p> : <NotificacoesList notes={notes} />}
      </div>
      <div className={styles["modal-footer"]}>
        <button
          className={styles["ver-mais-button"]}
          onClick={() => (window.location.href = "/user?page=8")}
        >
          Ver mais
        </button>
      </div>
    </div>
  );
};

export default NotificacoesModal;