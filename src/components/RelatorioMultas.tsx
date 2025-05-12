import React, { useEffect, useState, useCallback } from "react";
import { formatDate } from "../services/FormatDate";

interface Props {
  isVisible: boolean;
}

interface Multa {
  email: string;
  telefone: string;
  nome: string;
  id_emprestimo: number;
  data_devolver: string;
  pago: boolean;
}

export default function RelatorioMultas({ isVisible }: Props) {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [multasPendentes, setMultasPendentes] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"geral" | "pendentes">("geral");
  const [pageGeral, setPageGeral] = useState(1);
  const [pagePendentes, setPagePendentes] = useState(1);
  const [hasMoreGeral, setHasMoreGeral] = useState(true);
  const [hasMorePendentes, setHasMorePendentes] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const buscarMultas = useCallback(async () => {
    if (!hasMoreGeral || loading) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/relatorio/multas/${pageGeral}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setHasMoreGeral(false);
          return;
        }
        throw new Error("Erro ao buscar multas");
      }

      const data = await response.json();
      if (!data.multas || data.multas.length === 0) {
        setHasMoreGeral(false);
        return;
      }

      const formattedMultas = data.multas.map(
        (multa: [string, string, string, number, string, boolean]) => ({
          email: multa[0],
          telefone: multa[1],
          nome: multa[2],
          id_emprestimo: multa[3],
          data_devolver: multa[4],
          pago: multa[5],
        })
      );

      setMultas(prev => pageGeral === 1 ? formattedMultas : [...prev, ...formattedMultas]);
    } catch (error) {
      console.error("Erro ao buscar multas:", error);
    } finally {
      setLoading(false);
    }
  }, [pageGeral, hasMoreGeral, loading]);
  const buscarMultasPendentes = useCallback(async () => {
    if (!hasMorePendentes || loading) return;

    // Check if we should stop loading more for pendentes
    if (pagePendentes > 1 && multasPendentes.length === 0) {
      setHasMorePendentes(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/relatorio/multaspendentes/${pagePendentes}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setHasMorePendentes(false);
          return;
        }
        throw new Error("Erro ao buscar multas pendentes");
      }

      const data = await response.json();
      if (!data.multas_pendentes || data.multas_pendentes.length === 0) {
        setHasMorePendentes(false);
        return;
      }

      const formattedMultas = data.multas_pendentes.map(
        (multa: [string, string, string, number, string, boolean]) => ({
          email: multa[0],
          telefone: multa[1],
          nome: multa[2],
          id_emprestimo: multa[3],
          data_devolver: multa[4],
          pago: multa[5],
        })
      );

      setMultasPendentes(prev => 
        pagePendentes === 1 ? formattedMultas : [...prev, ...formattedMultas]
      );
    } catch (error) {
      console.error("Erro ao buscar multas pendentes:", error);
    } finally {
      setLoading(false);
    }
  }, [pagePendentes, hasMorePendentes, loading, multasPendentes.length]);

  const gerarPDF = async () => {
    try {
      const endpoint =
        abaAtiva === "geral"
          ? "http://localhost:5000/relatorio/gerar/multas"
          : "http://localhost:5000/relatorio/gerar/multas/pendentes";

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
          ? "relatorio_multas.pdf"
          : "relatorio_multas_pendentes.pdf"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    }
  };
  const handleScroll = useCallback(() => {
    if (loading || !isVisible) return;

    // Only trigger if we have scrollable content
    if (document.documentElement.scrollHeight <= window.innerHeight) return;

    if (
      window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - 100
    ) {
      if (abaAtiva === "geral" && hasMoreGeral) {
        setPageGeral(prev => prev + 1);
      } else if (abaAtiva === "pendentes" && hasMorePendentes) {
        setPagePendentes(prev => prev + 1);
      }
    }
  }, [loading, abaAtiva, hasMoreGeral, hasMorePendentes, isVisible]);

  useEffect(() => {
    // Only attach scroll listener when component is visible
    if (isVisible) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    // Reset states when changing tabs
    if (abaAtiva === "geral") {
      setPageGeral(1);
      setHasMoreGeral(true);
      setMultas([]);
      setInitialLoadDone(false); // Reset initial load flag to trigger new load
    } else {
      setPagePendentes(1);
      setHasMorePendentes(true);
      setMultasPendentes([]);
      setInitialLoadDone(false); // Reset initial load flag to trigger new load
    }
  }, [abaAtiva, isVisible]);

  useEffect(() => {
    if (!isVisible || initialLoadDone) return;

    // Initial load when component becomes visible
    if (abaAtiva === "geral") {
      buscarMultas();
    } else {
      buscarMultasPendentes();
    }
    setInitialLoadDone(true);
  }, [isVisible, initialLoadDone, abaAtiva, buscarMultas, buscarMultasPendentes]);

  useEffect(() => {
    if (!isVisible) return;

    // Only fetch if user has scrolled for more
    if ((abaAtiva === "geral" && pageGeral > 1) || 
        (abaAtiva === "pendentes" && pagePendentes > 1)) {
      if (abaAtiva === "geral") {
        buscarMultas();
      } else {
        buscarMultasPendentes();
      }
    }
  }, [
    isVisible, 
    abaAtiva, 
    pageGeral, 
    pagePendentes, 
    buscarMultas, 
    buscarMultasPendentes
  ]);

  return (
    <div
      className="montserrat-alternates"
      style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}
    >
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
          Relatório de Multas
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="montserrat-alternates"
            onClick={gerarPDF}
            disabled={loading}
            style={{
              padding: "8px 3px",
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
            onClick={() =>
              abaAtiva === "geral" ? buscarMultas() : buscarMultasPendentes()
            }
            disabled={loading}
            className="montserrat-alternates"
            style={{
              padding: "8px 3px",
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
        className="montserrat-alternates"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setAbaAtiva("geral")}
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
          onClick={() => setAbaAtiva("pendentes")}
          style={{
            padding: "8px 16px",
            backgroundColor: abaAtiva === "pendentes" ? "#2473D9" : "#ccc",
            color: abaAtiva === "pendentes" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Pendentes
        </button>
      </div>

      {abaAtiva === "geral" && (
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
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Email</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Telefone</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Nome</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>ID Empréstimo</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Data Devolver</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Pago</th>
              </tr>
            </thead>
            <tbody>
              {multas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="montserrat-alternates" style={{ textAlign: "center", padding: "20px" }}>
                    {loading ? "Carregando..." : "Nenhuma multa encontrada."}
                  </td>
                </tr>
              ) : (
                multas.map((multa, index) => (
                  <tr key={`${multa.id_emprestimo}-${index}`} style={{ borderBottom: "1px solid #ddd" }}>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.email}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.telefone}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.nome}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.id_emprestimo}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>
                      {multa.data_devolver ? formatDate(multa.data_devolver) : "N/A"}
                    </td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.pago ? "Sim" : "Não"}</td>
                  </tr>
                ))
              )}
            </tbody>          </table>
          {!loading && hasMoreGeral && multas.length > 0 && (
            <div className="montserrat-alternates" style={{ textAlign: "center", padding: "10px", color: "#666" }}>
              Carregando mais multas...
            </div>
          )}
        </div>
      )}

      {abaAtiva === "pendentes" && (
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
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Email</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Telefone</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Nome</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>ID Empréstimo</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Data Devolver</th>
                <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Pago</th>
              </tr>
            </thead>
            <tbody>
              {multasPendentes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="montserrat-alternates" style={{ textAlign: "center", padding: "20px" }}>
                    {loading ? "Carregando..." : "Nenhuma multa pendente encontrada."}
                  </td>
                </tr>
              ) : (
                multasPendentes.map((multa, index) => (
                  <tr key={`${multa.id_emprestimo}-${index}`} style={{ borderBottom: "1px solid #ddd" }}>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.email}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.telefone}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.nome}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.id_emprestimo}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>
                      {multa.data_devolver ? formatDate(multa.data_devolver) : "N/A"}
                    </td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{multa.pago ? "Sim" : "Não"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && hasMorePendentes && multasPendentes.length > 0 && (
            <div className="montserrat-alternates" style={{ textAlign: "center", padding: "10px", color: "#666" }}>
              Carregando mais multas pendentes...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
