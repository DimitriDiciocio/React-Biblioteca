import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface AtenderReservaProps {
  id: string;
  onAtenderSuccess: () => void;
}

const AtenderReserva: React.FC<AtenderReservaProps> = ({
  id,
  onAtenderSuccess,
}) => {
  const navigate = useNavigate();

  const handleAtenderReserva = async () => {
    const confirmResult = await Swal.fire({
      title: "Confirmar Atendimento",
      text: "Você tem certeza que deseja atender esta reserva?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, atender",
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
        `http://127.0.0.1:5000/reserva/${id}/atender`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        Swal.fire(
          "Sucesso",
          `Reserva atendida com sucesso! Data para devolução: ${data.data_devolver}`,
          "success"
        );
        onAtenderSuccess(); // Atualiza a lista de reservas
      } else {
        const errorData = await response.json();
        Swal.fire(
          "Erro",
          errorData.message || "Erro ao atender a reserva.",
          "error"
        );
      }
    } catch (error) {
      Swal.fire(
        "Erro",
        "Ocorreu um erro ao conectar com o servidor: " + String(error),
        "error"
      );
    }
  };

  return (
    <div>
      <button
        className="salvar montserrat-alternates-semibold"
        onClick={handleAtenderReserva}
      >
        <span>Atender Reserva</span>
      </button>
    </div>
  );
};

export default AtenderReserva;