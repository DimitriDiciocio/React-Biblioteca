import React, { useState } from "react";
import Swal from "sweetalert2";

interface DeletarUsuarioProps {
  usuarioId: number;
  onDeleteSuccess: (usuarioId: number) => void;
}

const DeletarUsuario: React.FC<DeletarUsuarioProps> = ({
  usuarioId,
  onDeleteSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmacao = await Swal.fire({
      title: "Tem certeza?",
      text: "Essa ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacao.isConfirmed) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/deletar_usuario", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id_usuario: usuarioId }),
      });

      if (response.ok) {
        await Swal.fire(
          "Deletado!",
          "O usuário foi removido com sucesso.",
          "success"
        );
        onDeleteSuccess(usuarioId);
      } else {
        await Swal.fire(
          "Erro!",
          "Não foi possível excluir o usuário.",
          "error"
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      await Swal.fire(
        "Erro!",
        "Ocorreu um erro ao tentar excluir o usuário.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-danger"
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm"></span>
      ) : (
        <span className="material-icons">delete</span>
      )}
    </button>
  );
};

export default DeletarUsuario;
