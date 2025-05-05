import React, { useState, useEffect } from "react";
import { Note } from "../services/useNotification";
import { marcarComoLida } from "../services/useNotification";
import { io } from "socket.io-client";

interface Props {
  notes: Note[];
  onAtualizar?: () => void;
}

const NotificacoesList: React.FC<Props> = ({ notes, onAtualizar }) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const socket = io("http://127.0.0.1:5000");

  useEffect(() => {
    setLocalNotes(notes); // Atualiza as notificações se o prop mudar
  }, [notes]);

  useEffect(() => {
    socket.emit("notificacoesVisualizadas"); // Notifica o backend que as notificações foram visualizadas
  }, [socket]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarcarComoLida = async (id: number) => {
    await marcarComoLida(id);
    setLocalNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id_notificacao === id ? { ...note, lida: true } : note
      )
    );
    socket.emit("notificacoesLidas");
    if (onAtualizar) onAtualizar();
  };

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
                className={`notificacao-item ${!note.lida ? "nova" : ""} fundo-site`}
              >
                <div className="notificacao-header">
                  <h3 className="notificacao-titulo">{note.titulo}</h3>
                  <small className="notificacao-data">{note.data_adicionada}</small>
                </div>
                <p className="notificacao-mensagem">{note.mensagem}</p>
                {!note.lida && (
                  <div className="notificacao-actions">
                    <strong className="nova">Nova</strong>
                    <button
                      className="marcar-como-lida-btn"
                      onClick={() => handleMarcarComoLida(note.id_notificacao)}
                    >
                      Marcar como lida
                    </button>
                  </div>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};
export default NotificacoesList;