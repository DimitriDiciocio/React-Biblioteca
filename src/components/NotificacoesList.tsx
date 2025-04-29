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
<div className="notificacoes-container">
  {notes.length === 0 ? (
    <p className="sem-notificacoes">Sem notificações.</p>
  ) : (
    <ul className="notificacoes-lista">
      {notes
        .slice() // Cria uma cópia do array original para não modificar o original
        .reverse() // Inverte a ordem
        .map((note) => (
          <li key={note.id_notificacao} className={`notificacao-item ${!note.lida ? 'nova' : ''}`}>
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
