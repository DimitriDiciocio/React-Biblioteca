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

interface Props {
  isVisible: boolean;
}

const RelatorioUsuarios: React.FC<Props> = ({ isVisible }) => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const buscarUsuarios = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/relatorio/usuarios/${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setHasMore(false);
          return;
        }
        throw new Error("Erro ao buscar usuários");
      }

      const data = await response.json();
      if (!data.usuarios || data.usuarios.length === 0) {
        setHasMore(false);
        return;
      }

      // Check if new data is different from the existing data
      const newUsers = data.usuarios.filter(
        newUser => !users.some(existingUser => existingUser.id === newUser.id)
      );

      if (newUsers.length === 0) {
        setHasMore(false);
        return;
      }

      setUsers(prev => [...prev, ...newUsers]);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, users]);

  const relatorioPDF = async () => {
    try {
      const response = await fetch("http://localhost:5000/relatorio/gerar/usuarios", {
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
      link.setAttribute("download", "relatorio_usuarios.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    }
  };

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    // Only trigger if we have scrollable content
    if (document.documentElement.scrollHeight <= window.innerHeight) return;

    if (
      window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - 100
    ) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (isVisible) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, isVisible]);

  useEffect(() => {
    if (isVisible) {
      if (!initialLoadDone) {
        buscarUsuarios();
        setInitialLoadDone(true);
      } else if (page > 1) {
        // Only fetch if user has scrolled for more
        buscarUsuarios();
      }
    }
  }, [page, buscarUsuarios, initialLoadDone, isVisible]);

  if (users.length === 0 && !loading && !hasMore) {
    return <div>Nenhum usuário encontrado.</div>;
  }

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
        className="relatorio-title "
      >
        <h1 className="montserrat-alternates" style={{ fontSize: "16px", fontWeight: "bold" }}>Relatório de Usuários</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="montserrat-alternates"
            onClick={relatorioPDF}
            style={{
              padding: "8px 5px",
              backgroundColor: "#2473D9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Gerar PDF
          </button>
          <button className="montserrat-alternates"
            onClick={buscarUsuarios}
            disabled={loading}
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
          overflowX: "auto",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Nome</th>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>E-mail</th>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Telefone</th>
              <th className="montserrat-alternates" style={{ textAlign: "left", padding: "12px" }}>Endereço</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="montserrat-alternates" style={{ textAlign: "center", padding: "20px" }}>
                  {loading ? "Carregando..." : "Nenhum usuário encontrado."}
                </td>
              </tr>
            ) : (
              <>
                {users.map((usuario, index) => (
                  <tr 
                    key={usuario.id} 
                    style={{ 
                      borderBottom: "1px solid #ddd",
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' 
                    }}
                  >
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{usuario.nome}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{usuario.email}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{usuario.telefone}</td>
                    <td className="montserrat-alternates" style={{ padding: "10px" }}>{usuario.endereco}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 className="montserrat-alternates" style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
          Usuários por Estado (simulado)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gerarDadosGrafico(users)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="estado" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#4A90E2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>      </div>
      {!loading && hasMore && (
        <div className="montserrat-alternates" style={{ textAlign: "center", padding: "10px", color: "#666" }}>
          Carregando mais usuários...
        </div>
      )}
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

export default RelatorioUsuarios;
