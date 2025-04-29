import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";

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
    const [historico, setHistorico] = useState<Historico | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const isAllowed = usePermission(1);

    const puxarHistorico = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/puxar_historico", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();
            if (!response.ok) {
                setError(result.error || "Erro ao puxar histórico");
                return;
            }

            setHistorico(result);
        } catch (error) {
            console.error("Erro ao puxar histórico:", error);
            setError("Erro ao puxar histórico.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        puxarHistorico();
    }, [token]);

    const [filtros, setFiltros] = useState({
        emprestimosAtivos: "",
        emprestimosConcluidos: "",
        reservasAtivas: "",
        multasPendentes: "",
        multasConcluidas: ""
      });
      
      const handleFiltroChange = (campo, valor) => {
        setFiltros({ ...filtros, [campo]: valor.toLowerCase() });
      };

    if (isAllowed === null) return <p>Verificando permissão...</p>;
    if (!isAllowed) return null;
    if (loading) return <p>Carregando...</p>;
    if (error) return <p>{error}</p>;
    if (!historico) return <p>Erro ao carregar histórico.</p>;

    return (
        <div>
          <div className="espaco-vazio"></div>
          <div className="historico-container">
            <h2>Histórico da Biblioteca</h2>
      
            {/* Empréstimos Ativos */}
            <section>
              <h3>📚 Empréstimos Ativos</h3>
              <input
                type="text"
                placeholder="Pesquisar título ou autor..."
                className="barra-pesquisa"
                value={filtros.emprestimosAtivos}
                onChange={(e) => handleFiltroChange("emprestimosAtivos", e.target.value)}
              />
              <div className="historico-bloco">
                {historico.emprestimos_ativos.filter((item) =>
                  `${item.titulo} ${item.autor}`.toLowerCase().includes(filtros.emprestimosAtivos)
                ).map((item) => (
                  <div key={item.id_emprestimo} className="historico-item">
                    <p><strong>{item.titulo}</strong> - {item.autor}</p>
                    <p>Retirado: {item.data_retirada}</p>
                    <p>Devolver até: {item.data_devolver}</p>
                  </div>
                ))}
              </div>
            </section>
      
            {/* Empréstimos Concluídos */}
            <section>
              <h3>📖 Empréstimos Concluídos</h3>
              <input
                type="text"
                placeholder="Pesquisar título ou autor..."
                className="barra-pesquisa"
                value={filtros.emprestimosConcluidos}
                onChange={(e) => handleFiltroChange("emprestimosConcluidos", e.target.value)}
              />
              <div className="historico-bloco">
                {historico.emprestimos_concluidos.filter((item) =>
                  `${item.titulo} ${item.autor}`.toLowerCase().includes(filtros.emprestimosConcluidos)
                ).map((item) => (
                  <div key={item.id_emprestimo} className="historico-item">
                    <p><strong>{item.titulo}</strong> - {item.autor}</p>
                    <p>Retirado: {item.data_retirada}</p>
                    <p>Devolvido: {item.data_devolvido}</p>
                  </div>
                ))}
              </div>
            </section>
      
            {/* Reservas Ativas */}
            <section>
              <h3>📝 Reservas Ativas</h3>
              <input
                type="text"
                placeholder="Pesquisar título ou autor..."
                className="barra-pesquisa"
                value={filtros.reservasAtivas}
                onChange={(e) => handleFiltroChange("reservasAtivas", e.target.value)}
              />
              <div className="historico-bloco">
                {historico.reservas_ativas.filter((item) =>
                  `${item.titulo} ${item.autor}`.toLowerCase().includes(filtros.reservasAtivas)
                ).map((item) => (
                  <div key={item.id_reserva} className="historico-item">
                    <p><strong>{item.titulo}</strong> - {item.autor}</p>
                    <p>Reservado em: {item.data_criacao}</p>
                    <p>Válido até: {item.data_validade}</p>
                  </div>
                ))}
              </div>
            </section>
      
            {/* Multas Pendentes */}
            <section>
              <h3>💰 Multas Pendentes</h3>
              <input
                type="text"
                placeholder="Pesquisar por empréstimo..."
                className="barra-pesquisa"
                value={filtros.multasPendentes}
                onChange={(e) => handleFiltroChange("multasPendentes", e.target.value)}
              />
              <div className="historico-bloco">
                {historico.multas_pendentes.filter((multa) =>
                  `Empréstimo #${multa.id_emprestimo}`.toLowerCase().includes(filtros.multasPendentes)
                ).map((multa) => (
                  <div key={multa.id_multa} className="historico-item multa">
                    <p><strong>Empréstimo #{multa.id_emprestimo}</strong></p>
                    <p>Valor Base: R$ {multa.valor_base}</p>
                    <p>Acrescimo: R$ {multa.valor_acrescimo}</p>
                    <p>Total: <strong>R$ {multa.total}</strong></p>
                  </div>
                ))}
              </div>
            </section>
      
            {/* Multas Concluídas */}
            <section>
              <h3>✅ Multas Concluídas</h3>
              <input
                type="text"
                placeholder="Pesquisar por empréstimo..."
                className="barra-pesquisa"
                value={filtros.multasConcluidas}
                onChange={(e) => handleFiltroChange("multasConcluidas", e.target.value)}
              />
              <div className="historico-bloco">
                {historico.multas_concluidas.filter((multa) =>
                  `Empréstimo #${multa.id_emprestimo}`.toLowerCase().includes(filtros.multasConcluidas)
                ).map((multa) => (
                  <div key={multa.id_multa} className="historico-item multa">
                    <p><strong>Empréstimo #{multa.id_emprestimo}</strong></p>
                    <p>Valor Base: R$ {multa.valor_base}</p>
                    <p>Acrescimo: R$ {multa.valor_acrescimo}</p>
                    <p>Total: <strong>R$ {multa.total}</strong></p>
                    <p>Status: Pago</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      );
      
};

export default PuxarHistorico;
