import React, { useEffect, useState, useCallback } from "react";
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
  descricao: string;
  selectedTags: Tag[];
  ano_publicado: string;
  imagem: string;
  avaliacao: number;
  idiomas: string;
}

export default function RelatorioLivros({ isVisible }: Props) {
  const [livros, setLivros] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"geral" | "faltando">("geral");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const buscarLivros = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const endpoint =
        abaAtiva === "geral"
          ? `http://localhost:5000/relatorio/livros/${page}`
          : `http://localhost:5000/relatorio/livrosfaltando/${page}`;

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

      setLivros(prev => {
        // Verifica se os novos livros já existem para evitar duplicação
        const newBooks = data.livros.filter((newBook: Book) => 
          !prev.some(existingBook => existingBook.id === newBook.id)
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

  const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
  const threshold = document.documentElement.offsetHeight - 100;

  if (scrollPosition >= threshold) {
    setPage(prev => prev + 1);
    buscarLivros(); // CHAMAR AQUI GARANTE QUE SÓ OCORRE DEPOIS DO SCROLL
  }
}, [loading, hasMore, buscarLivros]);


  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    // Reset states when changing tabs
    setPage(1);
    setHasMore(true);
    setLivros([]);
  }, [abaAtiva]);

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

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
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
        <h1 style={{ fontSize: "16px", fontWeight: "bold" }}>
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
              padding: "8px 5px",
              backgroundColor: "#2473D9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <span>Gerar PDF</span>
          </button>
          <button
            onClick={buscarLivros}
            disabled={loading}
            className="montserrat-alternates"
            style={{
              padding: "8px 5px",
              backgroundColor: "#2473D9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
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
          }}
        >
          Faltando
        </button>
      </div>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Título</th>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Autor</th>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Categoria</th>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>
                {abaAtiva === "geral" ? "Disponíveis" : "Quantidade Emprestada"}
              </th>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Ano Publicado</th>
            </tr>
          </thead>
          <tbody>
            {livros.length === 0 ? (
              <tr>
                <td colSpan={5} className="montserrat-alternates" style={{ textAlign: "center", padding: "20px" }}>
                  {loading ? "Carregando..." : "Nenhum livro encontrado."}
                </td>
              </tr>
            ) : (
              <>
                {livros.map((livro) => (
                  <tr key={livro.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{livro.titulo}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{livro.autor}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{livro.categoria}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>
                      {abaAtiva === "geral" ? livro.qtd_disponivel : livro.qtd_emprestada}
                    </td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{livro.ano_publicado}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
        {!loading && hasMore && (
          <div className="montserrat-alternates" style={{ textAlign: "center", padding: "10px", color: "#666" }}>
            Carregando mais livros...
          </div>
        )}
      </div>
      {abaAtiva === "geral" && (
        <div
          style={{
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <>
            <h2
              className="montserrat-alternates"
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "16px",
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
