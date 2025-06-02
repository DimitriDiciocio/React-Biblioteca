import Swal from "sweetalert2";
import { NavigateFunction } from "react-router-dom";

export const handleDevolverEmprestimo = async (
  id: string,
  navigate: NavigateFunction,
  onReturnSuccess: () => void
) => {
  const confirmResult = await Swal.fire({
    title: "Confirmar Devolução",
    text: "Você tem certeza que deseja devolver este empréstimo?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, devolver",
    cancelButtonText: "Cancelar",
    customClass: {
      title: "montserrat-alternates-semibold",
      htmlContainer: "montserrat-alternates-semibold",
      confirmButton: "montserrat-alternates-semibold",
      cancelButton: "montserrat-alternates-semibold",
    },
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
      Swal.fire({
        title: "Sucesso",
        text: "Empréstimo devolvido com sucesso!",
        icon: "success",
        customClass: {
          title: "montserrat-alternates-semibold",
          htmlContainer: "montserrat-alternates-semibold",
          confirmButton: "montserrat-alternates-semibold",
          cancelButton: "montserrat-alternates-semibold",
        },
      });
      onReturnSuccess();
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
