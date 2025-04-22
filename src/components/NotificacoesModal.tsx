import React from "react";
import { useNotification } from "../services/useNotification";
import NotificacoesList from "./NotificacoesList";

const NotificacoesModal: React.FC = () => {
  const { notes, loading } = useNotification();

  return (
    <div style={{ background: "#fff", padding: "1rem", borderRadius: "8px"}}>
      <h3>Notificações</h3>
      {loading ? <p>Carregando...</p> : <NotificacoesList notes={notes} />}
    </div>
  );
};

export default NotificacoesModal;