import React, { useEffect, useState, useCallback } from "react";
import styles from "../pages/Movimentacoes.module.css";
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
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
        }}
        className="relatorio-title"
      >
        <h1 className={styles.title}>Relatório de Usuários</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="montserrat-alternates"
            onClick={relatorioPDF}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2473D9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 400,
            }}
          >
            Gerar PDF
          </button>
          <button className="montserrat-alternates"
            onClick={buscarUsuarios}
            disabled={loading}
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

      <section className={styles["table-container"]}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Endereço</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                  {loading ? "Carregando..." : "Nenhum usuário encontrado."}
                </td>
              </tr>
            ) : (
              users.map((usuario) => (
                <tr
                  key={usuario.id}
                  style={{
                    background: "#fff",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.telefone}</td>
                  <td>{usuario.endereco}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 className="montserrat-alternates" style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#2473d9" }}>
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
        </ResponsiveContainer>
      </div>
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
