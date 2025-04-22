import { useEffect, useState } from "react";

export interface Note {
  id_notificacao: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_adicionada: string;
}

export function useNotification() {
    const token = localStorage.getItem("token");
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      async function fetchNotes() {
        try {
          const response = await fetch("http://127.0.0.1:5000/notificacoes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const json = await response.json();
  
          if (response.ok && json.notificacoes) {
            const formatted: Note[] = json.notificacoes.map((n: any) => ({
              id_notificacao: n.ID_NOTIFICACAO,
              titulo: n.TITULO,
              mensagem: n.MENSAGEM,
              lida: n.LIDA,
              data_adicionada: n.DATA_ADICIONADA,
            }));
  
            setNotes(formatted);
          }
        } catch (error) {
          console.error("Erro ao buscar notificações:", error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchNotes();
    }, [token]);
  
    return { notes, loading };
  }

  export const marcarComoLida = async (id_notificacao: number) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://127.0.0.1:5000/notificacoes/ler/${id_notificacao}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.json();
  };
  