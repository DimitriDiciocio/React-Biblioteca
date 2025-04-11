import Swal from "sweetalert2";
import { NavigateFunction } from "react-router-dom";

export const atenderReserva = async (
  id: string,
  navigate: NavigateFunction
): Promise<boolean> => {
  const confirmResult = await Swal.fire({
    title: "Confirmar Atendimento",
    text: "Você tem certeza que deseja atender esta reserva?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, atender",
    cancelButtonText: "Cancelar",
  });

  if (!confirmResult.isConfirmed) return false;

  const token = localStorage.getItem("token");

  if (!token) {
    Swal.fire("Erro", "Token não encontrado. Faça login novamente.", "error");
    navigate("/login");
    return false;
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
      Swal.fire(
        "Sucesso",
        `Reserva atendida com sucesso!`,
        "success"
      );
      return true;
    } else {
      const errorData = await response.json();
      Swal.fire(
        "Erro",
        errorData.message || "Erro ao atender a reserva.",
        "error"
      );
      return false;
    }
  } catch (error) {
    Swal.fire(
      "Erro",
      "Ocorreu um erro ao conectar com o servidor: " + String(error),
      "error"
    );
    return false;
  }
};
