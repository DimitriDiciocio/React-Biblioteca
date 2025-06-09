import React, { useEffect, useState, useRef } from "react";
import styles from "./Movimentacoes.module.css";
import { useNavigate } from "react-router-dom";
import { handleDevolverEmprestimo } from "../components/DevolverEmprestimo";
import { atenderReserva } from "../services/atenderReservaService";
import { atenderEmprestimo } from "../services/atenderEmprestimoService";
import { cancelarReserva } from "../services/cancelarReserva";
import { formatDateTime } from "../services/FormatDate";
import OwlCarousel from 'react-owl-carousel'; // npm install react-owl-carousel
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

const InfoModal: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="modal-data"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 32,
          minWidth: 320,
          maxWidth: 400,
          width: "100%",
          position: "relative",
          zIndex: 100000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
          }}
          aria-label="Fechar"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

type Movimentacao = {
  tipo: string;
  id: number;
  usuario: string;
  titulo: string;
  id_livro: string; // <- adicione este campo (é uma string com ids separados por vírgula)
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
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoMovimentacao, setInfoMovimentacao] = useState<Movimentacao | null>(null);

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

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  const breakLines = (text: string, max: number) => {
    let result = "";
    for (let i = 0; i < text.length; i += max) {
      result += text.slice(i, i + max) + (i + max < text.length ? "\n" : "");
    }
    return result;
  };

  // Função para obter a URL da capa do livro, igual ao padrão usado na Home e MostrarLivros
  const getCapaUrl = (titulo: string, id?: number) => {
    // Usa o id da movimentação para buscar a imagem
    // Se id não for passado, retorna imagem padrão
    if (!infoMovimentacao?.id) return "/assets/img/book-default.png";
    return `http://127.0.0.1:5000/uploads/livros/${infoMovimentacao.id}.jpeg`;
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
              <th>Tipo</th>
              <th>Status</th>
              <th>Ações</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((m) => (
              <tr key={`${m.tipo}-${m.id}`}>
                <td>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {/* Garante que cada livro fique em uma linha diferente */}
                    {(Array.isArray(m.titulo) ? m.titulo : String(m.titulo).split(","))
                      .map((tituloLivro: string, idx: number) => (
                        <li
                          key={idx}
                          style={{
                            listStyleType: "disc",
                            whiteSpace: "normal",
                            fontFamily: "inherit"
                          }}
                        >
                          {truncate(tituloLivro.trim(), 80)}
                        </li>
                      ))}
                  </ul>
                </td>
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
                <td>
                  <div
                    className="info-btn"
                    onClick={() => {
                      setInfoMovimentacao(m);
                      setInfoModalOpen(true);
                    }}
                  >
                    i
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={observerRef} className={styles.observer}></div>
      </section>
      <InfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      >
        <h2 style={{ marginBottom: 16 }}>Informações da Movimentação</h2>
        {infoMovimentacao && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Carrossel de capas */}
            <div style={{ marginBottom: 16 }}>
              {(() => {
                const titulos = Array.isArray(infoMovimentacao.titulo)
                  ? infoMovimentacao.titulo
                  : String(infoMovimentacao.titulo).split(",");
                const ids = Array.isArray(infoMovimentacao.id_livro)
                  ? infoMovimentacao.id_livro
                  : String(infoMovimentacao.id_livro || "").split(",");
                // Debug: log ids brutos e separados
                console.log("id_livro bruto:", infoMovimentacao.id_livro);
                console.log("ids separados:", ids);

                if (titulos.length === 1) {
                  // Apenas um livro, não usa OwlCarousel
                  const idLivro = (ids[0] || "").trim();
                  return (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <img
                        src={`http://127.0.0.1:5000/uploads/livros/${idLivro}.jpeg`}
                        alt={`Capa do livro`}
                        style={{
                          width: "150px",
                          height: "220px",
                          objectFit: "cover",
                          borderRadius: 8,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                        }}
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/assets/img/book-default.png";
                        }}
                      />
                    </div>
                  );
                }

                // Mais de um livro, usa OwlCarousel com loop
                return (
                  <OwlCarousel
                    className="owl-theme"
                    items={1}
                    loop
                    margin={10}
                    nav
                    dots
                    autoplayTimeout={3000}
                    style={{ width: "100%", maxWidth: 250, margin: "0 auto" }}
                  >
                    {titulos.map((tituloLivro: string, idx: number) => {
                      const idLivro = (ids[idx] || "").trim();
                      console.log(`Livro ${idx}:`, { titulo: tituloLivro, idLivro });
                      return (
                        <div key={idx} style={{ display: "flex", justifyContent: "center" }}>
                          <img
                            src={`http://127.0.0.1:5000/uploads/livros/${idLivro}.jpeg`}
                            alt={`Capa do livro`}
                            style={{
                              width: "150px",
                              height: "220px",
                              objectFit: "cover",
                              borderRadius: 8,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                            }}
                            onError={e => {
                              (e.target as HTMLImageElement).src = "/assets/img/book-default.png";
                            }}
                          />
                        </div>
                      );
                    })}
                  </OwlCarousel>
                );
              })()}
            </div>
            <div style={{ fontFamily: "Montserrat Alternates, Montserrat, Arial, sans-serif" }}>
              <strong>Data de Criação:</strong>{" "}
              {formatDateTime(
              infoMovimentacao.data_criacao
                ? new Date(infoMovimentacao.data_criacao).toISOString()
                : null
              ) || "-"}
            </div>
            <div style={{ fontFamily: "Montserrat Alternates, Montserrat, Arial, sans-serif" }}>
              <strong>Data de Retirada:</strong>{" "}
              {formatDateTime(
              infoMovimentacao.data_retirada
                ? new Date(infoMovimentacao.data_retirada).toISOString()
                : null
              ) || "-"}
            </div>
            <div style={{ fontFamily: "Montserrat Alternates, Montserrat, Arial, sans-serif" }}>
              <strong>Data para Devolver:</strong>{" "}
              {formatDateTime(
              infoMovimentacao.data_devolver
                ? new Date(infoMovimentacao.data_devolver).toISOString()
                : null
              ) || "-"}
            </div>
            <div style={{ fontFamily: "Montserrat Alternates, Montserrat, Arial, sans-serif" }}>
              <strong>Data de Validade:</strong>{" "}
              {formatDateTime(
              infoMovimentacao.data_validade
                ? new Date(infoMovimentacao.data_validade).toISOString()
                : null
              ) || "-"}
            </div>
            <div style={{ fontFamily: "Montserrat Alternates, Montserrat, Arial, sans-serif" }}>
              <strong>Data Devolvida:</strong>{" "}
              {formatDateTime(
              infoMovimentacao.data_devolvida
                ? new Date(infoMovimentacao.data_devolvida).toISOString()
                : null
              ) || "-"}
            </div>
          </div>
        )}
      </InfoModal>
    </div>
  );
};

export default Movimentacoes;
