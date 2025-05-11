import React, { useEffect, useState, useRef } from "react";
import styles from "./Movimentacoes.module.css";
import { useNavigate } from "react-router-dom";
import { handleDevolverEmprestimo } from "../components/DevolverEmprestimo";
import { atenderReserva } from "../services/atenderReservaService";
import { atenderEmprestimo } from "../services/atenderEmprestimoService";
import { cancelarReserva } from "../services/cancelarReserva";
import { formatDate } from "../services/FormatDate";

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
  data_validade?: number | null;
};

const Movimentacoes: React.FC = () => {
  const [data, setData] = useState<Movimentacao[] | null>(null);
  const [filteredData, setFilteredData] = useState<Movimentacao[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    usuario: "",
    titulo: "",
    tipo: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters); // Debounced filters
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true); // Track if more data is available

  const observerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovimentacoes = async () => {
      setLoading(true);
      try {
        const endpoint =
          debouncedFilters.usuario ||
          debouncedFilters.titulo ||
          debouncedFilters.tipo
            ? `http://localhost:5000/movimentacoes/pesquisa/${page}`
            : `http://localhost:5000/movimentacoes/${page}`;
        const method =
          debouncedFilters.usuario ||
          debouncedFilters.titulo ||
          debouncedFilters.tipo
            ? "POST"
            : "GET";

        const res = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body:
            method === "POST"
              ? JSON.stringify({
                  pesquisaUsuario: debouncedFilters.usuario,
                  pesquisaTitulo: debouncedFilters.titulo,
                  tipoMovimentacao: debouncedFilters.tipo,
                })
              : null,
        });
        const json: Movimentacao[] = await res.json();

        if (json.length === 0) {
          setHasMoreData(false);
          return;
        }

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
            : null,
        }));

        setData((prevData) =>
          page === 1 ? parsedData : [...(prevData || []), ...parsedData]
        );
        setFilteredData((prevData) =>
          page === 1 ? parsedData : [...(prevData || []), ...parsedData]
        );
      } catch (err) {
        console.error("Erro ao buscar movimentações:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovimentacoes();
  }, [page, debouncedFilters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreData && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMoreData, loading]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setDebouncedFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      setPage(1);
      setHasMoreData(true);
    }, 300); // Debounce delay
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
        return tipo === "emprestimo" ? styles.ativo : styles.devolvido;
      case "ATENDIDA":
        return styles.devolvido;
      case "DEVOLVIDO":
        return styles.devolvido;
      case "CANCELADO":
      case "CANCELADA":
      case "EXPIRADO":
        return styles.cancelado;
      case "EM ESPERA":
        return styles.emEspera;
      default:
        return "";
    }
  };

  const handleActionUpdate = (id: number, updatedStatus: string) => {
    setData((prevData) =>
      prevData
        ? prevData.map((item) =>
            item.id === id ? { ...item, status: updatedStatus } : item
          )
        : null
    );
    setFilteredData((prevData) =>
      prevData
        ? prevData.map((item) =>
            item.id === id ? { ...item, status: updatedStatus } : item
          )
        : null
    );
  };

  return (
    <div className={styles.container}>
      <i
        className="fa-solid fa-arrow-left arrow-back"
        onClick={() => navigate("/home_biblio?page=1")}
      ></i>
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
              <th>Data Validade</th>
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
                              handleActionUpdate(m.id, "DEVOLVIDO");
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
                          handleActionUpdate(m.id, "ATENDIDA");
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
                          handleActionUpdate(m.id, "CANCELADA");
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
                          handleActionUpdate(m.id, "ATIVO");
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
        <div ref={observerRef} className={styles.observer}></div>
      </section>
    </div>
  );
};

export default Movimentacoes;
