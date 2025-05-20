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
}

const PuxarHistorico = () => {
  const token = localStorage.getItem("token");
  const [historico, setHistorico] = useState<Historico>({
    emprestimos_ativos: [],
    emprestimos_concluidos: [],
    reservas_ativas: [],
    multas_pendentes: [],
    multas_concluidas: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("emprestimosAtivos");
  const isAllowed = usePermission(1);

  const [paginaEmpAtiv, setPaginaEmpAtiv] = useState(1);
  const [paginaEmpConc, setPaginaEmpConc] = useState(1);
  const [paginaResAtiv, setPaginaResAtiv] = useState(1);
  const [paginaMulPend, setPaginaMulPend] = useState(1);
  const [paginaMulConc, setPaginaMulConc] = useState(1);

  const [hasMoreEmpAtiv, setHasMoreEmpAtiv] = useState(true);
  const [hasMoreEmpConc, setHasMoreEmpConc] = useState(true);
  const [hasMoreResAtiv, setHasMoreResAtiv] = useState(true);
  const [hasMoreMulPend, setHasMoreMulPend] = useState(true);
  const [hasMoreMulConc, setHasMoreMulConc] = useState(true);

  const handleScroll = useCallback(() => {
    if (loading) return;

    const historicElement = document.getElementById("historic0");
    if (
      historicElement &&
      window.innerHeight + historicElement.scrollTop
      >= historicElement.offsetHeight - 100
    ) {
      switch (activeTab) {
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
  }, [loading, activeTab, hasMoreEmpAtiv, hasMoreEmpConc, hasMoreResAtiv, hasMoreMulPend, hasMoreMulConc]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const puxarHistorico = useCallback(async () => {
    try {
      let endpoint = "";

      switch (activeTab) {
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

      switch (activeTab) {
        case "emprestimosAtivos":
          setHistorico((prev) => ({
            ...prev,
            emprestimos_ativos: [...prev.emprestimos_ativos, ...result],
          }));
          setHasMoreEmpAtiv(result.length > 0);
          break;
        case "emprestimosConcluidos":
          setHistorico((prev) => ({
            ...prev,
            emprestimos_concluidos: [...prev.emprestimos_concluidos, ...result],
          }));
          setHasMoreEmpConc(result.length > 0);
          break;
        case "reservasAtivas":
          setHistorico((prev) => ({
            ...prev,
            reservas_ativas: [...prev.reservas_ativas, ...result],
          }));
          setHasMoreResAtiv(result.length > 0);
          break;
        case "multasPendentes":
          setHistorico((prev) => ({
            ...prev,
            multas_pendentes: [...prev.multas_pendentes, ...result],
          }));
          setHasMoreMulPend(result.length > 0);
          break;
        case "multasConcluidas":
          setHistorico((prev) => ({
            ...prev,
            multas_concluidas: [...prev.multas_concluidas, ...result],
          }));
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
    }
  }, [activeTab, paginaEmpAtiv, paginaEmpConc, paginaResAtiv, paginaMulPend, paginaMulConc, token]);
  const handleTabChange = (tab: string) => {
    if (loading || activeTab === tab) return; // Prevent tab change while loading or if already active
    setActiveTab(tab);
    setHistorico({
      emprestimos_ativos: [],
      emprestimos_concluidos: [],
      reservas_ativas: [],
      multas_pendentes: [],
      multas_concluidas: [],
    }); // Clear previous data

    // Reset pagination for all tabs
    setPaginaEmpAtiv(1);
    setPaginaEmpConc(1);
    setPaginaResAtiv(1);
    setPaginaMulPend(1);
    setPaginaMulConc(1);

    // Reset hasMore flags
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
            <div>              {historico.emprestimos_ativos.length > 0 ? (
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
              {!loading && hasMoreEmpAtiv && (
                <p className="loading-more montserrat-alternates">Carregando mais itens...</p>
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
            <div>              {historico.emprestimos_concluidos.length > 0 ? (
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
              {!loading && hasMoreEmpConc && (
                <p className="loading-more montserrat-alternates">Carregando mais itens...</p>
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
            <div>              {historico.reservas_ativas.length > 0 ? (
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
              {!loading && hasMoreResAtiv && (
                <p className="loading-more montserrat-alternates">Carregando mais itens...</p>
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
            <div>              {historico.multas_pendentes.length > 0 ? (
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
              {!loading && hasMoreMulPend && (
                <p className="loading-more montserrat-alternates">Carregando mais itens...</p>
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
            <div>              {historico.multas_concluidas.length > 0 ? (
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
              {!loading && hasMoreMulConc && (
                <p className="loading-more montserrat-alternates">Carregando mais itens...</p>
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
