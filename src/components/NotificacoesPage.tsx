import React from "react";
import { useNotification } from "../services/useNotification";
import NotificacoesList from "../components/NotificacoesList";

const NotificacoesPage: React.FC = () => {
  const { notes, loading } = useNotification();

  if (loading) return <p>Carregando notificações...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Minhas Notificações</h2>
      <NotificacoesList notes={notes} />
    </div>
  );
};

export default NotificacoesPage;
