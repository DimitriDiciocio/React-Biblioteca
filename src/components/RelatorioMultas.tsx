import React, { useEffect, useState } from "react";
import { formatDate } from "../services/FormatDate";

interface Multa {
  email: string;
  telefone: string;
  nome: string;
  id_emprestimo: number;
  data_devolver: string;
  pago: boolean; // Adicionado para indicar se foi pago ou não
}

export default function RelatorioMultas() {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [multasPendentes, setMultasPendentes] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"geral" | "pendentes">("geral");

  const buscarMultas = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/relatorio/multas", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setMultas(
        data.multas.map(
          (multa: [string, string, string, number, string, boolean]) => ({
            email: multa[0],
            telefone: multa[1],
            nome: multa[2],
            id_emprestimo: multa[3],
            data_devolver: multa[4],
            pago: multa[5],
          })
        )
      );
    } catch (error) {
      console.error("Erro ao buscar multas:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarMultasPendentes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/relatorio/multaspendentes",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setMultasPendentes(
        data.multas_pendentes.map(
          (multa: [string, string, string, number, string, boolean]) => ({
            email: multa[0],
            telefone: multa[1],
            nome: multa[2],
            id_emprestimo: multa[3],
            data_devolver: multa[4],
            pago: multa[5],
          })
        )
      );
    } catch (error) {
      console.error("Erro ao buscar multas pendentes:", error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (abaAtiva === "geral") {
      buscarMultas();
    } else {
      buscarMultasPendentes();
    }
  }, [abaAtiva]);

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
                <th
                  className="montserrat-alternates"
                  style={{ textAlign: "left", padding: "12px" }}
                >
                  Email
                </th>
                <th
                  className="montserrat-alternates"
                  style={{ textAlign: "left", padding: "12px" }}
                >
                  Telefone
                </th>
                <th
                  className="montserrat-alternates"
                  style={{ textAlign: "left", padding: "12px" }}
                >
                  Nome
                </th>
                <th
                  className="montserrat-alternates"
                  style={{ textAlign: "left", padding: "12px" }}
                >
                  ID Empréstimo
                </th>
                <th
                  className="montserrat-alternates"
                  style={{ textAlign: "left", padding: "12px" }}
                >
                  Data Devolver
                </th>
                <th
                  className="montserrat-alternates"
                  style={{ textAlign: "left", padding: "12px" }}
                >
                  Pago
                </th>
              </tr>
            </thead>
            <tbody>
              {multas.map((multa, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td
                    className="montserrat-alternates"
                    style={{ padding: "10px" }}
                  >
                    {multa.email}
                  </td>
                  <td
                    className="montserrat-alternates"
                    style={{ padding: "10px" }}
                  >
                    {multa.telefone}
                  </td>
                  <td
                    className="montserrat-alternates"
                    style={{ padding: "10px" }}
                  >
                    {multa.nome}
                  </td>
                  <td
                    className="montserrat-alternates"
                    style={{ padding: "10px" }}
                  >
                    {multa.id_emprestimo}
                  </td>
                  <td
                    className="montserrat-alternates"
                    style={{ padding: "10px" }}
                  >
                    {multa.data_devolver
                      ? formatDate(multa.data_devolver)
                      : "N/A"}
                  </td>
                  <td
                    className="montserrat-alternates"
                    style={{ padding: "10px" }}
                  >
                    {multa.pago ? "Sim" : "Não"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Telefone</th>
                <th style={{ textAlign: "left", padding: "12px" }}>Nome</th>
                <th style={{ textAlign: "left", padding: "12px" }}>
                  ID Empréstimo
                </th>
                <th style={{ textAlign: "left", padding: "12px" }}>
                  Data Devolver
                </th>
                <th style={{ textAlign: "left", padding: "12px" }}>Pago</th>
              </tr>
            </thead>
            <tbody>
              {multasPendentes.map((multa, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "10px" }}>{multa.email}</td>
                  <td style={{ padding: "10px" }}>{multa.telefone}</td>
                  <td style={{ padding: "10px" }}>{multa.nome}</td>
                  <td style={{ padding: "10px" }}>{multa.id_emprestimo}</td>
                  <td style={{ padding: "10px" }}>
                    {multa.data_devolver
                      ? formatDate(multa.data_devolver)
                      : "N/A"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {multa.pago ? "Sim" : "Não"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
