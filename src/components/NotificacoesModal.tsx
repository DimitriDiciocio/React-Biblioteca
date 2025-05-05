import React from "react";
import { useNotification } from "../services/useNotification";
import NotificacoesList from "./NotificacoesList";
import styles from "./NotificacoesModal.module.css";

interface NotificacoesModalProps {
  onClose: () => void;
}

const NotificacoesModal: React.FC<NotificacoesModalProps> = ({ onClose }) => {
  const { notes, loading } = useNotification();

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