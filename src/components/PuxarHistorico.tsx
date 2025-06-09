import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";
import historicIcon from "../../assets/img/historic-icon.png";
import { formatDateTime } from "../services/FormatDate";

interface Emprestimo {
  id_livro: number;
  titulo: string;
  autor: string;
  id_emprestimo: number;
  data_retirada: string;
  data_devolver: string;
  data_devolvido?: string;
}

interface Reserva {
  id_livro: number;
  titulo: string;
  autor: string;
  id_reserva: number;
  data_criacao: string;
  data_validade: string;
}

interface Multa {
  id_multa: number;
  valor_base: number;
  valor_acrescimo: number;
  total: number;
  id_emprestimo: number;
}

interface Historico {
  emprestimos_ativos: Emprestimo[];
  emprestimos_concluidos: Emprestimo[];
  reservas_ativas: Reserva[];
  multas_pendentes: Multa[];
  multas_concluidas: Multa[];
  emprestimos_pendentes: Emprestimo[]; // Add emprestimos_pendentes
}

const PuxarHistorico = () => {
  const token = localStorage.getItem("token");
  const [historico, setHistorico] = useState<Historico>({
    emprestimos_ativos: [],
    emprestimos_concluidos: [],
    reservas_ativas: [],
    multas_pendentes: [],
    multas_concluidas: [],
    emprestimos_pendentes: [], // Initialize emprestimos_pendentes
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("emprestimosPendentes");
  const isAllowed = usePermission(1);

  const [paginaEmpAtiv, setPaginaEmpAtiv] = useState(1);
  const [paginaEmpConc, setPaginaEmpConc] = useState(1);
  const [paginaResAtiv, setPaginaResAtiv] = useState(1);
  const [paginaMulPend, setPaginaMulPend] = useState(1);
  const [paginaMulConc, setPaginaMulConc] = useState(1);
  const [paginaEmpPend, setPaginaEmpPend] = useState(1); // Add pagination for emprestimos_pendentes

  const [hasMoreEmpAtiv, setHasMoreEmpAtiv] = useState(true);
  const [hasMoreEmpConc, setHasMoreEmpConc] = useState(true);
  const [hasMoreResAtiv, setHasMoreResAtiv] = useState(true);
  const [hasMoreMulPend, setHasMoreMulPend] = useState(true);
  const [hasMoreMulConc, setHasMoreMulConc] = useState(true);
  const [hasMoreEmpPend, setHasMoreEmpPend] = useState(true); // Add hasMore flag for emprestimos_pendentes

  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (loading || isFetching) return;

    const historicElement = document.querySelector(".historic"); // Fetch element by class name
    if (
      historicElement &&
      historicElement.scrollTop + historicElement.clientHeight
      >= historicElement.scrollHeight - 100
    ) {
      switch (activeTab) {
        case "emprestimosPendentes":
          if (hasMoreEmpPend) {
            setPaginaEmpPend(prev => prev + 1);
          }
          break;
        case "emprestimosAtivos":
          if (hasMoreEmpAtiv) {
            setPaginaEmpAtiv(prev => prev + 1);
          }
          break;
        case "emprestimosConcluidos":
          if (hasMoreEmpConc) {
            setPaginaEmpConc(prev => prev + 1);
          }
          break;
        case "reservasAtivas":
          if (hasMoreResAtiv) {
            setPaginaResAtiv(prev => prev + 1);
          }
          break;
        case "multasPendentes":
          if (hasMoreMulPend) {
            setPaginaMulPend(prev => prev + 1);
          }
          break;
        case "multasConcluidas":
          if (hasMoreMulConc) {
            setPaginaMulConc(prev => prev + 1);
          }
          break;
      }
    }
  }, [loading, isFetching, activeTab, hasMoreEmpAtiv, hasMoreEmpConc, hasMoreResAtiv, hasMoreMulPend, hasMoreMulConc, hasMoreEmpPend]);

  useEffect(() => {
    const historicElement = document.querySelector(".historic");
    if (historicElement) {
      historicElement.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (historicElement) {
        historicElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  const puxarHistorico = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      let endpoint = "";

      switch (activeTab) {
        case "emprestimosPendentes":
          endpoint = `historico/emprestimos_pendentes/${paginaEmpPend}`;
          break;
        case "emprestimosAtivos":
          endpoint = `historico/emprestimos_ativos/${paginaEmpAtiv}`;
          break;
        case "emprestimosConcluidos":
          endpoint = `historico/emprestimos_concluidos/${paginaEmpConc}`;
          break;
        case "reservasAtivas":
          endpoint = `historico/reservas_ativas/${paginaResAtiv}`;
          break;
        case "multasPendentes":
          endpoint = `historico/multas_pendentes/${paginaMulPend}`;
          break;
        case "multasConcluidas":
          endpoint = `historico/multas_concluidas/${paginaMulConc}`;
          break;
        default:
          return;
      }

      const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Erro ao puxar histórico");
        return;
      }

      // Ensure we have no duplicates by checking IDs
      const updateHistoricoState = (
        prevState: Historico,
        newItems: any[],
        key: keyof Historico
      ) => {
        const existingIds = new Set(
          prevState[key].map((item: any) => 
            'id_emprestimo' in item ? item.id_emprestimo : 
            'id_reserva' in item ? item.id_reserva :
            'id_multa' in item ? item.id_multa : null
          )
        );

        const uniqueNewItems = newItems.filter((item) => {
          const itemId = 
            'id_emprestimo' in item ? item.id_emprestimo : 
            'id_reserva' in item ? item.id_reserva :
            'id_multa' in item ? item.id_multa : null;
          return !existingIds.has(itemId);
        });

        return {
          ...prevState,
          [key]: [...prevState[key], ...uniqueNewItems]
        };
      };

      switch (activeTab) {
        case "emprestimosPendentes":
          setHistorico(prev => updateHistoricoState(prev, result, 'emprestimos_pendentes'));
          setHasMoreEmpPend(result.length > 0);
          break;
        case "emprestimosAtivos":
          setHistorico(prev => updateHistoricoState(prev, result, 'emprestimos_ativos'));
          setHasMoreEmpAtiv(result.length > 0);
          break;
        case "emprestimosConcluidos":
          setHistorico(prev => updateHistoricoState(prev, result, 'emprestimos_concluidos'));
          setHasMoreEmpConc(result.length > 0);
          break;
        case "reservasAtivas":
          setHistorico(prev => updateHistoricoState(prev, result, 'reservas_ativas'));
          setHasMoreResAtiv(result.length > 0);
          break;
        case "multasPendentes":
          setHistorico(prev => updateHistoricoState(prev, result, 'multas_pendentes'));
          setHasMoreMulPend(result.length > 0);
          break;
        case "multasConcluidas":
          setHistorico(prev => updateHistoricoState(prev, result, 'multas_concluidas'));
          setHasMoreMulConc(result.length > 0);
          break;
        default:
          return;
      }
    } catch (error) {
      console.error("Erro ao puxar histórico:", error);
      setError("Erro ao puxar histórico.");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [activeTab, paginaEmpPend, paginaEmpAtiv, paginaEmpConc, paginaResAtiv, paginaMulPend, paginaMulConc, token]);
  const handleTabChange = (tab: string) => {
    if (loading || isFetching || activeTab === tab) return;
    setActiveTab(tab);
    setHistorico({
      emprestimos_pendentes: [], // Clear emprestimos_pendentes data
      emprestimos_ativos: [],
      emprestimos_concluidos: [],
      reservas_ativas: [],
      multas_pendentes: [],
      multas_concluidas: [],
    }); // Clear previous data

    // Reset pagination for all tabs
    setPaginaEmpPend(1); // Reset pagination for emprestimos_pendentes
    setPaginaEmpAtiv(1);
    setPaginaEmpConc(1);
    setPaginaResAtiv(1);
    setPaginaMulPend(1);
    setPaginaMulConc(1);

    // Reset hasMore flags
    setHasMoreEmpPend(true); // Reset hasMore flag for emprestimos_pendentes
    setHasMoreEmpAtiv(true);
    setHasMoreEmpConc(true);
    setHasMoreResAtiv(true);
    setHasMoreMulPend(true);
    setHasMoreMulConc(true);

    setLoading(true); // Show loading state
  };

  useEffect(() => {
    puxarHistorico();
  }, [activeTab, puxarHistorico]);

  const [filtros, setFiltros] = useState({
    emprestimosAtivos: "",
    emprestimosConcluidos: "",
    reservasAtivas: "",
    multasPendentes: "",
    multasConcluidas: "",
    emprestimosPendentes: "", // Add filter for emprestimos_pendentes
  });

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros({ ...filtros, [campo]: valor.toLowerCase() });
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;
  if (error) return <p>{error}</p>;
  if (!historico) return <p>Erro ao carregar histórico.</p>;

  const renderTabContent = () => {
    switch (activeTab) {
      case "emprestimosPendentes":
        return (
          <div>
            <input
              type="text"
              placeholder="Pesquisar título ou autor..."
              className="barra-pesquisa montserrat-alternates"
              value={filtros.emprestimosPendentes}
              onChange={(e) =>
                handleFiltroChange("emprestimosPendentes", e.target.value)
              }
            />
            <div>
              {historico.emprestimos_pendentes.length > 0 ? (
                historico.emprestimos_pendentes
                  .filter((item) =>
                    `${item.titulo} ${item.autor}`
                      .toLowerCase()
                      .includes(filtros.emprestimosPendentes)
                  )
                  .map((item) => (
                    <div key={item.id_emprestimo} className="historico-item">
                      <p>
                        <strong>{item.titulo}</strong> - {item.autor}
                      </p>
                      <p>Data de Validade: {formatDateTime(item.data_validade)}</p>
                    </div>
                  ))
              ) : (
                <p className="no-data-message montserrat-alternates">
                  Não há empréstimos pendentes.
                </p>
              )}
            </div>
          </div>
        );
      case "emprestimosAtivos":
        return (
          <div>
            <input
              type="text"
              placeholder="Pesquisar título ou autor..."
              className="barra-pesquisa montserrat-alternates"
              value={filtros.emprestimosAtivos}
              onChange={(e) =>
                handleFiltroChange("emprestimosAtivos", e.target.value)
              }
            />
            <div>
              {historico.emprestimos_ativos.length > 0 ? (
                historico.emprestimos_ativos
                  .filter((item) =>
                    `${item.titulo} ${item.autor}`
                      .toLowerCase()
                      .includes(filtros.emprestimosAtivos)
                  )
                  .map((item) => (
                    <div key={item.id_emprestimo} className="historico-item">
                      <p>
                        <strong>{item.titulo}</strong> - {item.autor}
                      </p>
                      <p>Retirado: {formatDateTime(item.data_retirada)}</p>
                      <p>Devolver até: {formatDateTime(item.data_devolver)}</p>
                    </div>
                  ))
              ) : (
                <p className="no-data-message montserrat-alternates">Não há empréstimos ativos.</p>
              )}
            </div>
          </div>
        );
      case "emprestimosConcluidos":
        return (
          <div>
            <input
              type="text"
              placeholder="Pesquisar título ou autor..."
              className="barra-pesquisa montserrat-alternates"
              value={filtros.emprestimosConcluidos}
              onChange={(e) =>
                handleFiltroChange("emprestimosConcluidos", e.target.value)
              }
            />
            <div>
              {historico.emprestimos_concluidos.length > 0 ? (
                historico.emprestimos_concluidos
                  .filter((item) =>
                    `${item.titulo} ${item.autor}`
                      .toLowerCase()
                      .includes(filtros.emprestimosConcluidos)
                  )
                  .map((item) => (
                    <div key={item.id_emprestimo} className="historico-item montserrat-alternates">
                      <p>
                        <strong>{item.titulo}</strong> - {item.autor}
                      </p>                      <p>Retirado: {formatDateTime(item.data_retirada)}</p>
                      <p>Devolvido: {formatDateTime(item.data_devolvido || null)}</p>
                    </div>
                  ))
              ) : (
                <p className="no-data-message montserrat-alternates">Não há empréstimos concluídos.</p>
              )}
            </div>
          </div>
        );
      case "reservasAtivas":
        return (
          <div>
            <input
              type="text"
              placeholder="Pesquisar título ou autor..."
              className="barra-pesquisa montserrat-alternates"
              value={filtros.reservasAtivas}
              onChange={(e) =>
                handleFiltroChange("reservasAtivas", e.target.value)
              }
            />
            <div>
              {historico.reservas_ativas.length > 0 ? (
                historico.reservas_ativas
                  .filter((item) =>
                    `${item.titulo} ${item.autor}`
                      .toLowerCase()
                      .includes(filtros.reservasAtivas)
                  )
                  .map((item) => (
                    <div key={item.id_reserva} className="historico-item montserrat-alternates">
                      <p>
                        <strong>{item.titulo}</strong> - {item.autor}
                      </p>
                      <p>Reservado em: {formatDateTime(item.data_criacao)}</p>
                      <p>Válido até: {formatDateTime(item.data_validade)}</p>
                    </div>
                  ))
              ) : (
                <p className="no-data-message montserrat-alternates">Não há reservas ativas.</p>
              )}
            </div>
          </div>
        );
      case "multasPendentes":
        return (
          <div>
            <input
              type="text"
              placeholder="Pesquisar por empréstimo..."
              className="barra-pesquisa montserrat-alternates"
              value={filtros.multasPendentes}
              onChange={(e) =>
                handleFiltroChange("multasPendentes", e.target.value)
              }
            />
            <div>
              {historico.multas_pendentes.length > 0 ? (
                historico.multas_pendentes
                  .filter((multa) =>
                    `Empréstimo #${multa.id_emprestimo}`
                      .toLowerCase()
                      .includes(filtros.multasPendentes)
                  )
                  .map((multa) => (
                    <div key={multa.id_multa} className="historico-item multa montserrat-alternates">
                      <p>
                        <strong>Empréstimo #{multa.id_emprestimo}</strong>
                      </p>
                      <p>Valor Base: R$ {multa.valor_base}</p>
                      <p>Acrescimo: R$ {multa.valor_acrescimo}</p>
                      <p>
                        Total: <strong>R$ {multa.total}</strong>
                      </p>
                    </div>
                  ))
              ) : (
                <p className="no-data-message montserrat-alternates">Não há multas pendentes.</p>
              )}
            </div>
          </div>
        );
      case "multasConcluidas":
        return (
          <div>
            <input
              type="text"
              placeholder="Pesquisar por empréstimo..."
              className="barra-pesquisa montserrat-alternates"
              value={filtros.multasConcluidas}
              onChange={(e) =>
                handleFiltroChange("multasConcluidas", e.target.value)
              }
            />
            <div>
              {historico.multas_concluidas.length > 0 ? (
                historico.multas_concluidas
                  .filter((multa) =>
                    `Empréstimo #${multa.id_emprestimo}`
                      .toLowerCase()
                      .includes(filtros.multasConcluidas)
                  )
                  .map((multa) => (
                    <div key={multa.id_multa} className="historico-item multa montserrat-alternates">
                      <p>
                        <strong>Empréstimo #{multa.id_emprestimo}</strong>
                      </p>
                      <p>Valor Base: R$ {multa.valor_base}</p>
                      <p>Acrescimo: R$ {multa.valor_acrescimo}</p>
                      <p>
                        Total: <strong>R$ {multa.total}</strong>
                      </p>
                      <p>Status: Pago</p>
                    </div>
                  ))
              ) : (
                <p className="no-data-message montserrat-alternates">Não há multas concluídas.</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="historic0" className="historic">
    <div>
      <div className="historico-container">
        <div className="d-flex center-y">
          <img src={historicIcon} alt="Histórico" className="historic-icon" />
          <h2 className="montserrat-alternates-semibold">Histórico da Biblioteca</h2>
        </div>
        <div className="tabs">
          <button onClick={() => handleTabChange("emprestimosPendentes")} disabled={loading || activeTab === "emprestimosPendentes"}>
            Empréstimos Pendentes
          </button>
          <button onClick={() => handleTabChange("emprestimosAtivos")} disabled={loading || activeTab === "emprestimosAtivos"}>
            Empréstimos Ativos
          </button>
          <button onClick={() => handleTabChange("emprestimosConcluidos")} disabled={loading || activeTab === "emprestimosConcluidos"}>
            Empréstimos Concluídos
          </button>
          <button onClick={() => handleTabChange("reservasAtivas")} disabled={loading || activeTab === "reservasAtivas"}>
            Reservas Ativas
          </button>
          <button onClick={() => handleTabChange("multasPendentes")} disabled={loading || activeTab === "multasPendentes"}>
            Multas Pendentes
          </button>
          <button onClick={() => handleTabChange("multasConcluidas")} disabled={loading || activeTab === "multasConcluidas"}>
            Multas Concluídas
          </button>
        </div>
        {loading ? <p>Carregando...</p> : renderTabContent()}
      </div>
    </div>
  </section>
  );
};

export default PuxarHistorico;
