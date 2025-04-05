import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface DevolverEmprestimoProps {
  id: string;
  onReturnSuccess: () => void; // Callback to update the history
}

const DevolverEmprestimo: React.FC<DevolverEmprestimoProps> = ({
  id,
  onReturnSuccess,
}) => {
  const navigate = useNavigate();
  const handleDevolverEmprestimo = async () => {
    const confirmResult = await Swal.fire({
      title: "Confirmar Devolução",
      text: "Você tem certeza que deseja devolver este empréstimo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, devolver",
      cancelButtonText: "Cancelar",
    });

    if (!confirmResult.isConfirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("Erro", "Token não encontrado. Faça login novamente.", "error");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/emprestimos/${id}/devolver`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire("Sucesso", "Empréstimo devolvido com sucesso!", "success");
        onReturnSuccess(); // Trigger the callback to update the history
      } else {
        const errorData = await response.json();
        Swal.fire(
          "Erro",
          errorData.message || "Erro ao devolver empréstimo.",
          "error"
        );
      }
    } catch (error) {
      Swal.fire(
        "Erro",
        "Ocorreu um erro ao conectar com o servidor:" + String(error),
        "error"
      );
    }
  };

  return (
    <div>
      <button
        className="salvar montserrat-alternates-semibold"
        onClick={handleDevolverEmprestimo}
      >
        <span>Devolver Empréstimo</span>
      </button>
    </div>
  );
};

export default DevolverEmprestimo;
