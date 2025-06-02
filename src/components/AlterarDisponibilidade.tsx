import React, { useState } from "react";
import Swal from "sweetalert2";

interface DeletarLivroProps {
  id_livro: number;
  onStatusChange: () => void; // Callback para atualizar a lista de livros
}

const AlterarDisponibilidade: React.FC<DeletarLivroProps> = ({
  id_livro,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async () => {
    const confirmacao = await Swal.fire({
      title: "Tem certeza?",
      text: "O livro será marcado como indisponível!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, continuar!",
      cancelButtonText: "Cancelar",
      customClass: {
        title: "montserrat-alternates-semibold",
        confirmButton: "montserrat-alternates-semibold",
        htmlContainer: "montserrat-alternates-semibold",
        cancelButton: "montserrat-alternates-semibold"
      }
    });

    if (!confirmacao.isConfirmed) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/alterar_disponibilidade",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ id_livro }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: "Sucesso!",
          text: data.message,
          icon: "success",
          customClass: {
            title: "montserrat-alternates-semibold",
            confirmButton: "montserrat-alternates-semibold",
            htmlContainer: "montserrat-alternates-semibold",
            cancelButton: "montserrat-alternates-semibold"
          }
        });
        onStatusChange(); // Atualiza a lista de livros
      } else {
        await Swal.fire(
          "Erro!",
          "Não foi possível alterar a disponibilidade.",
          "error"
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      await Swal.fire(
        "Erro!",
        "Ocorreu um erro ao tentar alterar a disponibilidade.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStatusChange}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm"></span>
      ) : (
        <span className="material-icons">block</span>
      )}
    </button>
  );
};

export default AlterarDisponibilidade;
