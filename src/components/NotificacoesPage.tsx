import React, { useEffect } from "react";
import { useNotification } from "../services/useNotification";
import NotificacoesList from "../components/NotificacoesList";

const NotificacoesPage: React.FC = () => {
  const { notes, loading } = useNotification();

  useEffect(() => {
    const marcarTodasComoLidas = async () => {
      try {
        await fetch("http://127.0.0.1:5000/notificacoes/ler", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (notes) {
          localStorage.setItem("lastViewedNotifications", notes.length.toString());
        }
      } catch (error) {
        console.error("Erro ao marcar notificações como lidas:", error);
      }
    };

    marcarTodasComoLidas();
  }, [notes]);

  if (loading) return <p>Carregando notificações...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2 className="montserrat-alternates-semibold">Minhas Notificações</h2>
      <NotificacoesList notes={notes} />
    </div>
  );
};

export default NotificacoesPage;
