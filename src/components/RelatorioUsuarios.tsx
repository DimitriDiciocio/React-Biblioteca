import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface DadosGrafico {
  estado: string;
  quantidade: number;
}

export default function RelatorioUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/relatorio/usuarios");
      const data = await response.json();
      setUsuarios(data.usuarios);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = async () => {
    try {
      const response = await fetch("http://localhost:5000/relatorio/gerar/usuarios", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar o relatório de usuários.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "relatorio_usuarios.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar relatório de usuários:", error);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Relatório de Usuários</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={gerarPDF}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2473D9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Gerar PDF
          </button>
          <button
            onClick={buscarUsuarios}
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
              <th style={{ textAlign: "left", padding: "12px" }}>Nome</th>
              <th style={{ textAlign: "left", padding: "12px" }}>E-mail</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Telefone</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Endereço</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{usuario.nome}</td>
                <td style={{ padding: "10px" }}>{usuario.email}</td>
                <td style={{ padding: "10px" }}>{usuario.telefone}</td>
                <td style={{ padding: "10px" }}>{usuario.endereco}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
          Usuários por Estado (simulado)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gerarDadosGrafico(usuarios)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="estado" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#4A90E2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function gerarDadosGrafico(usuarios: Usuario[]): DadosGrafico[] {
  const estados: Record<string, number> = {};
  usuarios.forEach(({ endereco }) => {
    const estado = endereco?.split(",").pop()?.trim() || "Desconhecido";
    estados[estado] = (estados[estado] || 0) + 1;
  });
  return Object.entries(estados).map(([estado, quantidade]) => ({
    estado,
    quantidade,
  }));
}
