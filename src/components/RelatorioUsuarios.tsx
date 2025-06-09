import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const [filters, setFilters] = useState({ usuario: "" });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscarUsuarios = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      console.log('Estado atual:', {
        filtro: debouncedFilters.usuario,
        pagina: page,
        hasMore,
        loading
      });
      
      const endpoint = debouncedFilters.usuario
        ? `http://localhost:5000/relatorio/usuarios/${page}/pesquisa`
        : `http://localhost:5000/relatorio/usuarios/${page}`;
      const method = debouncedFilters.usuario ? "POST" : "GET";

      console.log('Requisição:', {
        endpoint,
        method,
        body: method === "POST" ? { pesquisa: debouncedFilters.usuario } : null
      });

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: method === "POST" ? JSON.stringify({ pesquisa: debouncedFilters.usuario }) : null,
      });

      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Nenhum resultado encontrado (404)');
          setHasMore(false);
          return;
        }
        throw new Error("Erro ao buscar usuários");
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      if (!data.usuarios || data.usuarios.length === 0) {
        console.log('Nenhum usuário retornado na resposta');
        setHasMore(false);
        return;
      }

      if (page === 1) {
        console.log('Primeira página ou nova busca, substituindo lista:', data.usuarios.length, 'usuários');
        setUsers(data.usuarios);
      } else {
        const newUsers = data.usuarios.filter(
          (newUser: Usuario) => !users.some(existingUser => existingUser.id === newUser.id)
        );
        console.log('Página subsequente, adicionando:', newUsers.length, 'novos usuários');

        if (newUsers.length === 0) {
          console.log('Nenhum novo usuário para adicionar');
          setHasMore(false);
          return;
        }

        setUsers(prev => [...prev, ...newUsers]);
      }
    } catch (error) {
      console.error("Erro detalhado ao buscar usuários:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, users, debouncedFilters]);

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

  // Efeito para buscar usuários quando os filtros mudarem
  useEffect(() => {
    if (isVisible) {
      if (debouncedFilters.usuario) {
        console.log('Filtros atualizados, iniciando nova busca:', debouncedFilters.usuario);
        setPage(1);
        setHasMore(true);
        setUsers([]); // Limpa a lista atual
        buscarUsuarios();
      } else {
        console.log('Filtro limpo, voltando ao GET padrão');
        setPage(1);
        setHasMore(true);
        setUsers([]); // Limpa a lista atual
        buscarUsuarios();
      }
    }
  }, [isVisible, debouncedFilters.usuario]); // Removido buscarUsuarios das dependências

  // Efeito para primeira carga e paginação
  useEffect(() => {
    if (isVisible) {
      console.log('Carregando página:', page);
      buscarUsuarios();
    }
  }, [isVisible, page]); // Removido buscarUsuarios das dependências

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Input alterado:', value);
    
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      console.log('Aplicando novo filtro após debounce:', value);
      setDebouncedFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    }, 300);
  };

  if (users.length === 0 && !loading && !hasMore) {
    return <div>Nenhum usuário encontrado.</div>;
  }

  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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

        <section className={styles.filters}>
          <input
            type="text"
            name="usuario"
            placeholder="Pesquisar por usuário"
            className={styles.input}
            value={filters.usuario}
            onChange={handleFilterChange}
          />
        </section>
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
