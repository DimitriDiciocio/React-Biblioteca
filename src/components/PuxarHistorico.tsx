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
                    {historico.emprestimos_ativos.length > 0 ? (
                        historico.emprestimos_ativos.map((item) => (
                            <div key={item.id_emprestimo} className="historico-item">
                                <p><strong>{item.titulo}</strong> - {item.autor}</p>
                                <p>Retirado: {item.data_retirada}</p>
                                <p>Devolver até: {item.data_devolver}</p>
                            </div>
                        ))
                    ) : (
                        <p>Nenhum empréstimo ativo.</p>
                    )}
                </section>

                {/* Empréstimos Concluídos */}
                <section>
                    <h3>📖 Empréstimos Concluídos</h3>
                    {historico.emprestimos_concluidos.length > 0 ? (
                        historico.emprestimos_concluidos.map((item) => (
                            <div key={item.id_emprestimo} className="historico-item">
                                <p><strong>{item.titulo}</strong> - {item.autor}</p>
                                <p>Retirado: {item.data_retirada}</p>
                                <p>Devolvido: {item.data_devolvido}</p>
                            </div>
                        ))
                    ) : (
                        <p>Nenhum empréstimo concluído.</p>
                    )}
                </section>

                {/* Reservas Ativas */}
                <section>
                    <h3>📝 Reservas Ativas</h3>
                    {historico.reservas_ativas.length > 0 ? (
                        historico.reservas_ativas.map((item) => (
                            <div key={item.id_reserva} className="historico-item">
                                <p><strong>{item.titulo}</strong> - {item.autor}</p>
                                <p>Reservado em: {item.data_criacao}</p>
                                <p>Válido até: {item.data_validade}</p>
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma reserva ativa.</p>
                    )}
                </section>

                {/* Multas Pendentes */}
                <section>
                    <h3>💰 Multas Pendentes</h3>
                    {historico.multas_pendentes.length > 0 ? (
                        historico.multas_pendentes.map((multa) => (
                            <div key={multa.id_multa} className="historico-item multa">
                                <p><strong>Empréstimo #{multa.id_emprestimo}</strong></p>
                                <p>Valor Base: R$ {multa.valor_base}</p>
                                <p>Acrescimo: R$ {multa.valor_acrescimo}</p>
                                <p>Total: <strong>R$ {multa.total}</strong></p>
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma multa pendente.</p>
                    )}
                </section>

                {/* Multas Concluídas */}
                <section>
                    <h3>✅ Multas Concluídas</h3>
                    {historico.multas_concluidas.length > 0 ? (
                        historico.multas_concluidas.map((multa) => (
                            <div key={multa.id_multa} className="historico-item multa">
                                <p><strong>Empréstimo #{multa.id_emprestimo}</strong></p>
                                <p>Valor Base: R$ {multa.valor_base}</p>
                                <p>Acrescimo: R$ {multa.valor_acrescimo}</p>
                                <p>Total: <strong>R$ {multa.total}</strong></p>
                                <p>Status: Pago</p>
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma multa concluída.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PuxarHistorico;
