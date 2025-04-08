import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
  descricao: string;
  selectedTags: Tag[];
  ano_publicado: string;
  imagem: string;
  avaliacao: number;
  idiomas: string;
}

export default function RelatorioLivros() {
  const [livros, setLivros] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarLivros = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/relatorio/livros");
      const data = await response.json();
      setLivros(data.livros);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    } finally {
      setLoading(false);
    }
  };

  const relatorioPDF = async () => {
    try {
      const response = await fetch("http://localhost:5000/relatorio/gerar/livros", {
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
      link.setAttribute("download", "relatorio_livros.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    }
  };

  useEffect(() => {
    buscarLivros();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Relatório de Livros</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={relatorioPDF}
            style={{
              padding: "8px 16px",
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
            style={{
              padding: "8px 16px",
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

      <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ textAlign: "left", padding: "12px" }}>Título</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Autor</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Categoria</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Disponíveis</th>
            </tr>
          </thead>
          <tbody>
            {livros.map((livro) => (
              <tr key={livro.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{livro.titulo}</td>
                <td style={{ padding: "10px" }}>{livro.autor}</td>
                <td style={{ padding: "10px" }}>{livro.categoria}</td>
                <td style={{ padding: "10px" }}>{livro.qtd_disponivel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Livros por Idioma</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gerarDadosGrafico(livros)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="idioma" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#4A90E2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
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
  return Object.entries(idiomas).map(([idioma, quantidade]) => ({ idioma, quantidade }));
}
