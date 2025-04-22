import React, { useEffect, useState } from "react";
import styles from "./Movimentacoes.module.css";
import { useNavigate } from "react-router-dom";
import { handleDevolverEmprestimo } from "../components/DevolverEmprestimo";
import { atenderReserva } from "../services/atenderReservaService";
import { atenderEmprestimo } from "../services/atenderEmprestimoService";
import { cancelarReserva } from "../services/cancelarReserva";

type Movimentacao = {
  tipo: string;
  id: number;
  usuario: string;
  titulo: string;
  data_evento: number;
  data_evento_str: string;
  status: string;
  data_devolver?: number | null;
  data_devolvida?: number | null;
  data_criacao?: number | null;
  data_retirada?: number | null;
  data_validade?: number | null; // Adiciona o campo data_validade
};

const Movimentacoes: React.FC = () => {
  const [data, setData] = useState<Movimentacao[] | null>(null);
  const [filteredData, setFilteredData] = useState<Movimentacao[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    usuario: "",
    titulo: "",
    tipo: "",
    dataInicio: "",
    dataFim: "",
    desdeInicio: true,
    ateAgora: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/movimentacoes", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((json: Movimentacao[]) => {
        // A resposta já está agrupada e ordenada do mais recente para o mais antigo
        const parsedData = json.map((item) => ({
          ...item,
          data_evento: new Date(item.data_evento_str).getTime(),
          data_criacao: item.data_criacao
            ? new Date(item.data_criacao).getTime()
            : null,
          data_retirada: item.data_retirada
            ? new Date(item.data_retirada).getTime()
            : null,
          data_devolver: item.data_devolver
            ? new Date(item.data_devolver).getTime()
            : null,
          data_devolvida: item.data_devolvida
            ? new Date(item.data_devolvida).getTime()
            : null,
          data_validade: item.data_validade
            ? new Date(item.data_validade).getTime()
            : null, // Processa o campo data_validade
        }));

        setData(parsedData);
        setFilteredData(parsedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar movimentações:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data) return;

    const filtered = data.filter((m) => {
      const matchesUsuario = m.usuario
        .toLowerCase()
        .includes(filters.usuario.toLowerCase());
      const matchesTitulo = m.titulo
        .toLowerCase()
        .includes(filters.titulo.toLowerCase());
      const matchesTipo =
        !filters.tipo ||
        (filters.tipo === "emprestimo" &&
          m.tipo === "emprestimo" &&
          m.status !== "DEVOLVIDO") ||
        (filters.tipo === "devolucao" &&
          m.tipo === "emprestimo" &&
          m.status === "DEVOLVIDO") ||
        (filters.tipo !== "emprestimo" && filters.tipo === m.tipo);

      const dataEvento = m.data_evento;
      const dataInicio = filters.dataInicio
        ? new Date(filters.dataInicio).getTime()
        : 0;
      const dataFim = filters.dataFim
        ? new Date(filters.dataFim).getTime()
        : Infinity;

      const matchesData =
        (filters.desdeInicio || dataEvento >= dataInicio) &&
        (filters.ateAgora || dataEvento <= dataFim);

      return matchesUsuario && matchesTitulo && matchesTipo && matchesData;
    });

    setFilteredData(filtered);
  }, [filters, data]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return "—";
    const d = new Date(timestamp);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDescriptiveTipo = (tipo: string, status: string): string => {
    if (tipo === "emprestimo" && status === "DEVOLVIDO") {
      return "Devolução";
    }
    switch (tipo) {
      case "emprestimo":
        return "Empréstimo";
      case "reserva":
        return "Reserva";
      default:
        return tipo;
    }
  };

  const getStatusClass = (status: string, tipo: string): string => {
    switch (status.toUpperCase()) {
      case "PENDENTE":
        return styles.pendente;
      case "ATIVO":
        return tipo === "emprestimo" ? styles.ativo : styles.devolvido; // "ATIVO" for attended loans
      case "ATENDIDA":
        return styles.devolvido; // "ATENDIDA" for attended reservations
      case "DEVOLVIDO":
        return styles.devolvido;
      case "CANCELADO":
      case "CANCELADA":
      case "EXPIRADO":
        return styles.cancelado;
      case "EM ESPERA":
        return styles.emEspera; // Transform "em espera" to "emEspera"
      default:
        return "";
    }
  };

  if (loading)
    return <p className="text-center mt-10">Carregando movimentações...</p>;

  return (
    <div className={styles.container}>
      <i className="fa-solid fa-arrow-left arrow-back"  onClick={() => navigate("/home_biblio?page=1")}></i>
      <div className="space-sm"></div>
      <div className={styles.header}>
        <h1 className={styles.title}>Movimentações</h1>
      </div>
      <section className={styles.filters}>
        <input
          type="text"
          name="usuario"
          placeholder="Pesquisar por usuário"
          className={styles.input}
          value={filters.usuario}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="titulo"
          placeholder="Pesquisar por título"
          className={styles.input}
          value={filters.titulo}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="dataInicio"
          className={styles.input}
          value={filters.dataInicio}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="dataFim"
          className={styles.input}
          value={filters.dataFim}
          onChange={handleFilterChange}
        />
        <select
          name="tipo"
          className={styles.select}
          value={filters.tipo}
          onChange={handleFilterChange}
        >
          <option value="">Todos os tipos</option>
          <option value="emprestimo">Empréstimo</option>
          <option value="reserva">Reserva</option>
          <option value="devolucao">Devolução</option>
        </select>
      </section>

      <section className={styles["table-container"]}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Livro</th>
              <th>Usuário</th>
              <th>Tipo de Movimentação</th>
              <th>Data Criação</th>
              <th>Data Devolver</th>
              <th>Data Devolvida</th>
              <th>Data Retirada</th>
              <th>Data Validade</th> {/* Adiciona o cabeçalho da nova coluna */}
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((m) => (
              <tr key={`${m.tipo}-${m.id}`}>
                <td>{m.titulo}</td>
                <td>{m.usuario}</td>
                <td>
                  <span
                    className={`${styles.tag} ${
                      m.tipo === "emprestimo" && m.status === "DEVOLVIDO"
                        ? styles.devolucao
                        : m.tipo === "emprestimo"
                        ? styles.emprestimo
                        : m.tipo === "reserva"
                        ? styles.reserva
                        : styles.devolucao
                    }`}
                  >
                    {getDescriptiveTipo(m.tipo, m.status)}
                  </span>
                </td>
                <td>{formatDate(m.data_criacao ?? null)}</td>
                <td>{formatDate(m.data_devolver ?? null)}</td>
                <td>{formatDate(m.data_devolvida ?? null)}</td>
                <td>{formatDate(m.data_retirada ?? null)}</td>
                <td>{formatDate(m.data_validade ?? null)}</td>
                <td>
                  <span
                    className={`${styles.tag} ${getStatusClass(
                      m.status,
                      m.tipo
                    )}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td>
                  {m.tipo === "emprestimo" &&
                    m.status !== "DEVOLVIDO" &&
                    m.status !== "PENDENTE" && (
                      <button
                        className={styles["action-button"]}
                        onClick={() =>
                          handleDevolverEmprestimo(
                            String(m.id),
                            navigate,
                            () => {
                              setData((prevData) => {
                                if (!prevData) return null;
                                return prevData.map((item) =>
                                  item.id === m.id
                                    ? { ...item, status: "DEVOLVIDO" }
                                    : item
                                );
                              });
                            }
                          )
                        }
                      >
                        Devolver
                      </button>
                    )}
                  {m.tipo === "reserva" && m.status === "EM ESPERA" && (
                    <button
                      className={styles["action-button"]}
                      onClick={async () => {
                        const success = await atenderReserva(
                          String(m.id),
                          navigate
                        );
                        if (success) {
                          setData((prevData) => {
                            if (!prevData) return null;
                            return prevData.map((item) =>
                              item.id === m.id
                                ? { ...item, status: "ATENDIDA" }
                                : item
                            );
                          });
                        }
                      }}
                    >
                      Atender
                    </button>
                  )}
                  {m.tipo === "reserva" && m.status === "PENDENTE" && (
                    <button
                      className={styles["action-button"]}
                      onClick={async () => {
                        const success = await cancelarReserva(
                          String(m.id),
                          navigate
                        );
                        if (success) {
                          setData((prevData) => {
                            if (!prevData) return null;
                            return prevData.map((item) =>
                              item.id === m.id
                                ? { ...item, status: "CANCELADA" }
                                : item
                            );
                          });
                        }
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                  {m.tipo === "emprestimo" && m.status === "PENDENTE" && (
                    <button
                      className={styles["action-button"]}
                      onClick={async () => {
                        const success = await atenderEmprestimo(
                          String(m.id),
                          navigate
                        );
                        if (success) {
                          setData((prevData) => {
                            if (!prevData) return null;
                            return prevData.map((item) =>
                              item.id === m.id
                                ? { ...item, status: "ATIVO" }
                                : item
                            );
                          });
                        }
                      }}
                    >
                      Atender
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Movimentacoes;
