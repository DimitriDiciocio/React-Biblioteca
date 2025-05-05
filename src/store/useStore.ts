// store/useStore.ts
import { create } from 'zustand';
import { socket } from '../services/socket';

type Notificacao = {
  id: string;
  mensagem: string;
  lida: boolean;
};

type Store = {
  notificacoes: Notificacao[];
  modalAberto: boolean;
  novasVisualizadas: boolean;
  temNotificacoesNovas: boolean;
  setModalAberto: (aberto: boolean) => void;
  setNovasVisualizadas: (visto: boolean) => void;
  setTemNotificacoesNovas: (temNovas: boolean) => void;
  adicionarNotificacao: (n: Notificacao) => void;
  fetchNotificacoes: () => Promise<void>;
  marcarNotificacaoComoLida: (id: string) => Promise<void>;
  marcarTodasComoVisualizadas: () => Promise<void>;
};

export const useStore = create<Store>((set) => ({
  notificacoes: [],
  modalAberto: false,
  novasVisualizadas: true,
  temNotificacoesNovas: false,
  setModalAberto: (aberto) => set({ modalAberto: aberto }),
  setNovasVisualizadas: (visto) => set({ novasVisualizadas: visto }),
  setTemNotificacoesNovas: (temNovas) => set({ temNotificacoesNovas: temNovas }),
  adicionarNotificacao: (n) =>
    set((state) => {
      const currentCount = state.notificacoes.length + 1;
      const lastViewedCount = Number(localStorage.getItem("lastViewedNotifications") || "0");

      const temNovas = currentCount > lastViewedCount;

      localStorage.setItem("notificacoesnumber", currentCount.toString());
      return {
        notificacoes: [n, ...state.notificacoes],
        temNotificacoesNovas: temNovas,
      };
    }),
  fetchNotificacoes: async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/notificacoes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        set({ notificacoes: data.notificacoes });

        const currentCount = data.notificacoes.length;
        const lastViewedCount = Number(localStorage.getItem("lastViewedNotifications") || "0");

        const temNovas = currentCount > lastViewedCount || data.notificacoes.some((n: Notificacao) => !n.lida);

        localStorage.setItem("notificacoesnumber", currentCount.toString());
        set({ temNotificacoesNovas: temNovas });
      } else {
        console.error("Erro ao buscar notificações");
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  },
  marcarNotificacaoComoLida: async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/notificacoes/ler", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) => ({
            ...n,
            lida: true,
          })),
        }));
      } else {
        console.error("Erro ao marcar notificações como lidas");
      }
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas:", error);
    }
  },  
  marcarTodasComoVisualizadas: async () => {
    try {
      await fetch("http://127.0.0.1:5000/notificacoes/visualizadas", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const currentCount = Number(localStorage.getItem("notificacoesnumber") || "0");
      localStorage.setItem("lastViewedNotifications", currentCount.toString()); // Update last viewed count
      set({ novasVisualizadas: true, temNotificacoesNovas: false });
    } catch (error) {
      console.error("Erro ao marcar notificações como visualizadas:", error);
    }
  },
}));

// WebSocket event listener for new notifications
socket.on("nova_notificacao", (notificacao: Notificacao) => {
  const { adicionarNotificacao } = useStore.getState();
  adicionarNotificacao(notificacao);
});