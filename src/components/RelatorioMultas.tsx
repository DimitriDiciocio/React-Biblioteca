import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "../pages/Movimentacoes.module.css";
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
  const [filters, setFilters] = useState({ usuario: "" });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscarMultas = useCallback(async () => {
    if (!hasMoreGeral || loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/relatorio/multas/${pageGeral}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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

      setMultas((prev) =>
        pageGeral === 1 ? formattedMultas : [...prev, ...formattedMultas]
      );
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

      setMultasPendentes((prev) =>
        pagePendentes === 1 ? formattedMultas : [...prev, ...formattedMultas]
      );
    } catch (error) {
      console.error("Erro ao buscar multas pendentes:", error);
    } finally {
      setLoading(false);
    }
  }, [pagePendentes, hasMorePendentes, loading, multasPendentes.length]);

  const buscarMultasPorPesquisa = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/relatorio/multas/${pageGeral}/pesquisa`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pesquisa: debouncedFilters.usuario }),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setHasMoreGeral(false);
          return;
        }
        throw new Error("Erro ao buscar multas por pesquisa");
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

      setMultas((prev) =>
        pageGeral === 1 ? formattedMultas : [...prev, ...formattedMultas]
      );
    } catch (error) {
      console.error("Erro ao buscar multas por pesquisa:", error);
    } finally {
      setLoading(false);
    }
  }, [pageGeral, debouncedFilters.usuario, loading]);

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
  // --- NOVA LÓGICA DE PAGINAÇÃO E BUSCA, igual ao RelatorioLivros ---
  const handleScroll = useCallback(() => {
    if (loading) return;
    if (document.documentElement.scrollHeight <= window.innerHeight) return;
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (abaAtiva === "geral" && hasMoreGeral) {
        setPageGeral((prev) => prev + 1);
      } else if (abaAtiva === "pendentes" && hasMorePendentes) {
        setPagePendentes((prev) => prev + 1);
      }
    }
  }, [loading, abaAtiva, hasMoreGeral, hasMorePendentes]);

  useEffect(() => {
    if (isVisible) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, isVisible]);

  // Reset states when changing aba or visibilidade
  useEffect(() => {
    if (!isVisible) return;
    if (abaAtiva === "geral") {
      setPageGeral(1);
      setHasMoreGeral(true);
      setMultas([]);
      buscarMultas(); // Trigger API call for "geral"
    } else {
      setPagePendentes(1);
      setHasMorePendentes(true);
      setMultasPendentes([]);
      buscarMultasPendentes(); // Trigger API call for "pendentes"
    }
  }, [abaAtiva, isVisible]);

  // Busca inicial e por paginação
  useEffect(() => {
    if (!isVisible) return;
    if (abaAtiva === "geral") {
      if (pageGeral === 1 && multas.length === 0 && hasMoreGeral) {
        buscarMultas();
      } else if (pageGeral > 1 && hasMoreGeral) {
        buscarMultas();
      }
    } else if (abaAtiva === "pendentes") {
      if (
        pagePendentes === 1 &&
        multasPendentes.length === 0 &&
        hasMorePendentes
      ) {
        buscarMultasPendentes();
      } else if (pagePendentes > 1 && hasMorePendentes) {
        buscarMultasPendentes();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaAtiva, isVisible, pageGeral, pagePendentes]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }, 300);
  };

  useEffect(() => {
    if (isVisible) {
      if (debouncedFilters.usuario) {
        console.log('Filtros atualizados, iniciando nova busca:', debouncedFilters.usuario);
        setPageGeral(1);
        setHasMoreGeral(true);
        setMultas([]); // Limpa a lista atual
        buscarMultasPorPesquisa();
      } else {
        console.log('Filtro limpo, voltando ao GET padrão');
        setPageGeral(1);
        setHasMoreGeral(true);
        setMultas([]); // Limpa a lista atual
        buscarMultas();
      }
    }
  }, [isVisible, debouncedFilters.usuario]);

  useEffect(() => {
    if (isVisible && !debouncedFilters.usuario) {
      console.log('Carregando página:', pageGeral);
      buscarMultas();
    }
  }, [isVisible, pageGeral, debouncedFilters.usuario]);

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
        <h1 className={styles.title}>Relatório de Multas</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="montserrat-alternates"
            onClick={gerarPDF}
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
            <span>Gerar PDF</span>
          </button>
          <button
            onClick={() =>
              abaAtiva === "geral" ? buscarMultas() : buscarMultasPendentes()
            }
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
          onClick={() => setAbaAtiva("pendentes")}
          className="montserrat-alternates"
          style={{
            padding: "8px 16px",
            backgroundColor: abaAtiva === "pendentes" ? "#2473D9" : "#ccc",
            color: abaAtiva === "pendentes" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Pendentes
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="usuario"
          placeholder="Pesquisar por usuário"
          className={styles.input}
          value={filters.usuario}
          onChange={handleFilterChange}
        />
      </div>

      <section className={styles["table-container"]}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Telefone</th>
              <th>Nome</th>
              <th>ID Empréstimo</th>
              <th>Data Devolver</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            {(abaAtiva === "geral" ? multas : multasPendentes).length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32 }}>
                  {loading
                    ? "Carregando..."
                    : abaAtiva === "geral"
                    ? "Nenhuma multa encontrada."
                    : "Nenhuma multa pendente encontrada."}
                </td>
              </tr>
            ) : (
              (abaAtiva === "geral" ? multas : multasPendentes).map((multa, index) => (
                <tr
                  key={`${multa.id_emprestimo}-${index}`}
                  style={{
                    background: "#fff",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <td>{multa.email}</td>
                  <td>{multa.telefone}</td>
                  <td>{multa.nome}</td>
                  <td>{multa.id_emprestimo}</td>
                  <td>
                    {multa.data_devolver
                      ? formatDate(multa.data_devolver)
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`${styles.tag} ${
                        multa.pago ? styles.devolvido : styles.pendente
                      }`}
                    >
                      {multa.pago ? "Sim" : "Não"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
