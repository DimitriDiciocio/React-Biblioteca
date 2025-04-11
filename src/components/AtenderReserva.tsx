import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { atenderReserva } from "../services/atenderReservaService";

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

    const success = await atenderReserva(id, navigate);
    if (success) {
      onAtenderSuccess();
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
