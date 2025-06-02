import Swal from "sweetalert2";
import { NavigateFunction } from "react-router-dom";

export const atenderEmprestimo = async (
  id: string,
  navigate: NavigateFunction
): Promise<boolean> => {
  const confirmResult = await Swal.fire({
    title: "Confirmar Atendimento",
    text: "Você tem certeza que deseja atender este empréstimo?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, atender",
    cancelButtonText: "Cancelar",
    customClass: {
      title: "montserrat-alternates-semibold",
      htmlContainer: "montserrat-alternates-semibold",
      confirmButton: "montserrat-alternates-semibold",
      cancelButton: "montserrat-alternates-semibold",
    },
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
      `http://127.0.0.1:5000/emprestimo/${id}/atender`,
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
      Swal.fire({
        title: "Sucesso",
        html: `Empréstimo atendido com sucesso! Data para devolução: ${data.data_devolver}`,
        icon: "success",
        customClass: {
          title: "montserrat-alternates-semibold",
          htmlContainer: "montserrat-alternates-semibold",
          confirmButton: "montserrat-alternates-semibold",
          cancelButton: "montserrat-alternates-semibold",
        },
      });
      return true;
    } else {
      const errorData = await response.json();
      Swal.fire(
        "Erro",
        errorData.message || "Erro ao atender o empréstimo.",
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
