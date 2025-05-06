import React, { useState, useEffect } from "react";
import { Note } from "../services/useNotification";
import { io } from "socket.io-client";

interface Props {
  notes: Note[];
}

const NotificacoesList: React.FC<Props> = ({ notes }) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const socket = io("http://127.0.0.1:5000");

  useEffect(() => {
    setLocalNotes(notes); // Update notifications if props change
  }, [notes]);
useEffect(() => {
    socket.emit("notificacoesVisualizadas"); // Notifica o backend que as notificações foram visualizadas
  }, [socket]);


  useEffect(() => {
    socket.emit("notificacoesVisualizadas"); // Notifica o backend que as notificações foram visualizadas
  }, [socket]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="notificacoes-container">
      {localNotes.length === 0 ? (
        <p className="sem-notificacoes">Sem notificações.</p>
      ) : (
        <ul className="notificacoes-lista">
          {localNotes
            .slice()
            .reverse()
            .map((note) => (
              <li
                key={note.id_notificacao}
                className={`notificacao-item fundo-site`}
              >
                <div className="notificacao-header">
                  <h3 className="notificacao-titulo">{note.titulo}</h3>
                  <small className="notificacao-data">{note.data_adicionada}</small>
                </div>
                <p className="notificacao-mensagem">{note.mensagem}</p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default NotificacoesList;