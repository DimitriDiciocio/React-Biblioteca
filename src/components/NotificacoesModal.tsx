import React from "react";
import { useNotification } from "../services/useNotification";
import NotificacoesList from "./NotificacoesList";

const NotificacoesModal: React.FC = () => {
  const { notes, loading, refetch } = useNotification();

  return (
    <div style={{ background: "#fff", padding: "1rem", borderRadius: "8px", width: "300px" }}>
      <h3>Notificações</h3>
      {loading ? <p>Carregando...</p> : <NotificacoesList notes={notes} onAtualizar={refetch} />}
    </div>
  );
};

export default NotificacoesModal;
