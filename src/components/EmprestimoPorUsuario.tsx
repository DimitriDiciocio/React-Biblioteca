import React, { useEffect, useState } from "react";
import DevolverEmprestimo from "./DevolverEmprestimo.tsx"; // Import the DevolverEmprestimo component
import AtenderReserva from "./AtenderReserva"; // Importa o componente AtenderReserva
import { pagarMulta } from "../services/multaService";
import Swal from "sweetalert2";

interface EmprestimoAtivo {
  id_livro: number;
  titulo: string;
  autor: string;
  id_emprestimo: number;
  data_retirada: string;
  data_devolver: string;
}

interface EmprestimoConcluido extends EmprestimoAtivo {
  data_devolvido: string;
}

interface ReservaAtiva {
  id_livro: number;
  titulo: string;
  autor: string;
  id_reserva: number;
  data_criacao: string;
  data_validade: string;
  status: string;
}

interface Multa {
  id_multa: number;
  valor_base: number;
  valor_acrescimo: number;
  total: number;
  id_emprestimo: number;
  pago: boolean;
}

interface Historico {
  emprestimos_ativos: EmprestimoAtivo[];
  emprestimos_concluidos: EmprestimoConcluido[];
  reservas_ativas: ReservaAtiva[];
  multas_pendentes: Multa[];
  multas_concluidas: Multa[];
}

interface EmprestimoPorUsuarioProps {
  userId: string;
}

const HistoricoById: React.FC<EmprestimoPorUsuarioProps> = ({ userId }) => {
  const [historico, setHistorico] = useState<Historico | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePagarMulta = async (id_multa:number) => {
      try {
        await pagarMulta(id_multa);
        Swal.fire("Sucesso", "Multa paga com sucesso.", "success");
      } catch (err) {
        console.error("Erro ao pagar multa:", err);
        Swal.fire("Erro", "Erro ao pagar multa.", "error");
      }
    };

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/puxar_historico/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar histórico.");
        }
        const data = await response.json();
        setHistorico(data);
      } catch {
        setError("Erro ao buscar histórico.");
      }
    };

    fetchHistorico();
  }, [userId]);

  const refreshHistorico = () => {
    setHistorico(null); // Clear the current history
    setError(null); // Clear any existing error
    const fetchHistorico = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/puxar_historico/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar histórico.");
        }
        const data = await response.json();
        setHistorico(data);
      } catch {
        setError("Erro ao buscar histórico.");
      }
    };

    fetchHistorico();
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!historico) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h1>Histórico do Usuário</h1>

      <h2>Empréstimos Ativos</h2>
      <ul>
        {historico.emprestimos_ativos.map((emprestimo) => (
          <li key={emprestimo.id_emprestimo}>
            <p>ID do Livro: {emprestimo.id_livro}</p>
            <p>Título: {emprestimo.titulo}</p>
            <p>Autor: {emprestimo.autor}</p>
            <p>Data de Retirada: {emprestimo.data_retirada}</p>
            <p>Data para Devolver: {emprestimo.data_devolver}</p>
            <DevolverEmprestimo
              id={emprestimo.id_emprestimo.toString()}
              onReturnSuccess={refreshHistorico}
            />
          </li>
        ))}
      </ul>

      <h2>Empréstimos Concluídos</h2>
      <ul>
        {historico.emprestimos_concluidos.map((emprestimo) => (
          <li key={emprestimo.id_emprestimo}>
            <p>ID do Livro: {emprestimo.id_livro}</p>
            <p>Título: {emprestimo.titulo}</p>
            <p>Autor: {emprestimo.autor}</p>
            <p>Data de Retirada: {emprestimo.data_retirada}</p>
            <p>Data para Devolver: {emprestimo.data_devolver}</p>
            <p>Data Devolvido: {emprestimo.data_devolvido}</p>
          </li>
        ))}
      </ul>

      <h2>Reservas Ativas</h2>
      <ul>
        {historico.reservas_ativas.map((reserva) => (
          <li key={reserva.id_reserva}>
            <p>ID do Livro: {reserva.id_livro}</p>
            <p>Título: {reserva.titulo}</p>
            <p>Autor: {reserva.autor}</p>
            <p>Data de Criação: {reserva.data_criacao}</p>
            <p>Data de Validade: {reserva.data_validade}</p>
            <p>Status: {reserva.status}</p>
            {reserva.status === "EM ESPERA" && (
              <AtenderReserva
                id={reserva.id_reserva.toString()}
                onAtenderSuccess={refreshHistorico}
              />
            )}
          </li>
        ))}
      </ul>

      <h2>Multas Pendentes</h2>
      <ul>
        {historico.multas_pendentes.map((multa) => (
          <div>
            <li key={multa.id_multa}>
              <p>ID da Multa: {multa.id_multa}</p>
              <p>Valor Base: {multa.valor_base}</p>
              <p>Valor Acréscimo: {multa.valor_acrescimo}</p>
              <p>Total: {multa.total}</p>
              <p>ID do Empréstimo: {multa.id_emprestimo}</p>
              <p>Pago: {multa.pago ? "Sim" : "Não"}</p>
            </li>
            <button onClick={() => handlePagarMulta(multa.id_multa)} className="detalhes-usuario-button">
              Pagar Multa
            </button>
          </div>
        ))}
      </ul>

      <h2>Multas Concluídas</h2>
      <ul>
        {historico.multas_concluidas.map((multa) => (
          <li key={multa.id_multa}>
            <p>ID da Multa: {multa.id_multa}</p>
            <p>Valor Base: {multa.valor_base}</p>
            <p>Valor Acréscimo: {multa.valor_acrescimo}</p>
            <p>Total: {multa.total}</p>
            <p>ID do Empréstimo: {multa.id_emprestimo}</p>
            <p>Pago: {multa.pago ? "Sim" : "Não"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoricoById;
