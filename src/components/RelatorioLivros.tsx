import React, { useEffect, useState, useCallback } from "react";
import styles from "../pages/Movimentacoes.module.css";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "../index.css";
import "../styles/RelatorioLivros.css";
import ModalUsuariosFaltando from "./ModalUsuariosFaltando";

interface Props {
  isVisible: boolean;
}

interface Tag {
  id: number;
  nome: string;
}

interface Book {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string;
  qtd_disponivel: string;
  qtd_emprestada: string;
  qtd_total: string;
  descricao: string;
  selectedTags: Tag[];
  ano_publicado: string;
  imagem: string;
  avaliacao: number;
  idiomas: string;
  usuarios: string;
  id_usuarios: string;
}

export default function RelatorioLivros({ isVisible }: Props) {
  const [livros, setLivros] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"geral" | "faltando">("geral");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalUsuariosOpen, setModalUsuariosOpen] = useState(false);
  const [usuariosModal, setUsuariosModal] = useState<
    {
      id: number;
      nome: string;
      email?: string;
      telefone?: string;
    }[]
  >([]);
  const navigate = useNavigate();

  const buscarLivros = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const endpoint =
        abaAtiva === "geral"
          ? `http://localhost:5000/relatorio/livros/${page}`
          : `http://localhost:5000/relatorio/livros/faltando/${page}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setHasMore(false);
          return;
        }
        throw new Error("Erro ao buscar livros");
      }

      const data = await response.json();
      if (!data.livros || data.livros.length === 0) {
        setHasMore(false);
        return;
      }

      setLivros((prev) => {
        // Verifica se os novos livros já existem para evitar duplicação
        const newBooks = data.livros.filter(
          (newBook: Book) =>
            !prev.some((existingBook) => existingBook.id === newBook.id)
        );
        return page === 1 ? data.livros : [...prev, ...newBooks];
      });
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [abaAtiva, page, hasMore, loading]);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollPosition =
      window.innerHeight + document.documentElement.scrollTop;
    const threshold = document.documentElement.offsetHeight - 100;

    if (scrollPosition >= threshold) {
      setPage((prev) => prev + 1);
      buscarLivros(); // CHAMAR AQUI GARANTE QUE SÓ OCORRE DEPOIS DO SCROLL
    }
  }, [loading, hasMore, buscarLivros]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isVisible) return;
    setPage(1);
    setHasMore(true);
    setLivros([]);
  }, [abaAtiva, isVisible]);

  // Busca inicial após reset de estado
  useEffect(() => {
    if (!isVisible) return;
    if (page === 1 && livros.length === 0 && hasMore) {
      buscarLivros();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, livros.length, hasMore, isVisible, abaAtiva]);

  const relatorioPDF = async () => {
    try {
      const endpoint =
        abaAtiva === "geral"
          ? "http://localhost:5000/relatorio/gerar/livros"
          : "http://localhost:5000/relatorio/gerar/livros/faltando";

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar o relatório.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        abaAtiva === "geral"
          ? "relatorio_livros.pdf"
          : "relatorio_livros_faltando.pdf"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    }
  };

  const getUserInfo = (id: number, nome: string) => {
    // Aqui você pode buscar mais dados do backend se quiser
    return { id, nome };
  };

  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
        }}
        className="relatorio-title montserrat-alternates"
      >
        <h1
          className={styles.title}
          style={{
            margin: 0,
          }}
        >
          {abaAtiva === "geral"
            ? "Relatório de Livros"
            : "Relatório de Livros Faltando"}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={relatorioPDF}
            disabled={loading}
            className="montserrat-alternates"
            style={{
              padding: "8px 16px",
              backgroundColor: "#2473D9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <span>Gerar PDF</span>
          </button>
          <button
            onClick={buscarLivros}
            disabled={loading}
            className="montserrat-alternates"
            style={{
              padding: "8px 16px",
              backgroundColor: "#2473D9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setAbaAtiva("geral")}
          className="montserrat-alternates"
          style={{
            padding: "8px 16px",
            backgroundColor: abaAtiva === "geral" ? "#2473D9" : "#ccc",
            color: abaAtiva === "geral" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Geral
        </button>
        <button
          onClick={() => setAbaAtiva("faltando")}
          className="montserrat-alternates"
          style={{
            padding: "8px 16px",
            backgroundColor: abaAtiva === "faltando" ? "#2473D9" : "#ccc",
            color: abaAtiva === "faltando" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Faltando
        </button>
      </div>

      <section className={styles["table-container"]}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoria</th>
              <th>Emprestados</th>
              <th>Total</th>
              <th>Ano Publicado</th>
              {abaAtiva === "faltando" && <th>Usuários</th>}
            </tr>
          </thead>
          <tbody>
            {livros.length === 0 ? (
              <tr>
                <td
                  colSpan={abaAtiva === "faltando" ? 7 : 6}
                  style={{ textAlign: "center", padding: 32 }}
                >
                  {loading ? "Carregando..." : "Nenhum livro encontrado."}
                </td>
              </tr>
            ) : (
              livros.map((livro) => {
                const usuariosNomes =
                  livro.usuarios?.split(",").filter(Boolean) || [];
                const usuariosIds =
                  livro.id_usuarios?.split(",").filter(Boolean) || [];
                const usuariosList = usuariosNomes.map((nome, idx) => ({
                  nome: nome.trim(),
                  id: parseInt(usuariosIds[idx]),
                }));

                return (
                  <tr
                    key={livro.id}
                    style={{
                      background: "#fff",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <td>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        <li>{livro.titulo}</li>
                      </ul>
                    </td>
                    <td>{livro.autor}</td>
                    <td>{livro.categoria}</td>
                    <td style={{ textAlign: "center" }}>
                      {livro.qtd_emprestada}
                    </td>
                    <td style={{ textAlign: "center" }}>{livro.qtd_total}</td>
                    <td style={{ textAlign: "center" }}>
                      {livro.ano_publicado}
                    </td>
                    {abaAtiva === "faltando" && (
                      <td>
                        {usuariosList.length > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <div
                              className="info-btn"
                              onClick={() => {
                                setUsuariosModal(
                                  usuariosList.map((u) =>
                                    getUserInfo(u.id, u.nome)
                                  )
                                );
                                setModalUsuariosOpen(true);
                              }}
                              title="Ver todos os usuários"
                            >
                              i
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {abaAtiva === "geral" && (
        <div
          style={{
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
            boxShadow: "0 4px 8px rgba(36, 115, 217, 0.06)",
          }}
        >
          <>
            <h2
              className="montserrat-alternates"
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "16px",
                color: "#2473d9",
              }}
            >
              Livros por Idioma
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gerarDadosGrafico(livros)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="idioma" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="quantidade"
                  fill="#4A90E2"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        </div>
      )}

      {/* Modal de usuários faltando */}
      <ModalUsuariosFaltando
        open={modalUsuariosOpen}
        onClose={() => setModalUsuariosOpen(false)}
        usuarios={usuariosModal}
        onNavigate={(id) => {
          setModalUsuariosOpen(false);
          navigate(`/usuarios/${id}`);
        }}
      />
    </div>
  );
}

interface GraficoIdioma {
  idioma: string;
  quantidade: number;
}

function gerarDadosGrafico(livros: Book[]): GraficoIdioma[] {
  const idiomas: Record<string, number> = {};
  livros.forEach(({ idiomas: idioma }) => {
    idiomas[idioma] = (idiomas[idioma] || 0) + 1;
  });
  return Object.entries(idiomas).map(([idioma, quantidade]) => ({
    idioma,
    quantidade,
  }));
}
