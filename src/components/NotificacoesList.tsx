import React from "react";
import { Note } from "../services/useNotification";
import { marcarComoLida } from "../services/useNotification";

interface Props {
  notes: Note[];
  onAtualizar?: () => void;
}

const NotificacoesList: React.FC<Props> = ({ notes, onAtualizar }) => {
  const handleMarcarComoLida = async (id: number) => {
    await marcarComoLida(id);
    if (onAtualizar) onAtualizar();
  };

  return (
    <div>
      {notes.length === 0 ? (
        <p>Sem notificações.</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id_notificacao}>
              <h3>{note.titulo}</h3>
              <p>{note.mensagem}</p>
              <small>{note.data_adicionada}</small>
              {!note.lida && (
                <>
                  <strong> (Nova)</strong>
                  <button onClick={() => handleMarcarComoLida(note.id_notificacao)}>
                    Marcar como lida
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificacoesList;
