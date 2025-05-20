import React, { useState } from "react";
import Swal from "sweetalert2";

interface DeletarUsuarioProps {
  usuarioId: number;
  ativo: boolean;
  onStatusChange: (usuarioId: number, novoStatus: boolean) => void;
}

const DeletarUsuario: React.FC<DeletarUsuarioProps> = ({
  usuarioId,
  ativo,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (ativar: boolean) => {
    const endpoint = ativar ? '/reativar_usuario' : '/inativar_usuario';
    const action = ativar ? 'reativar' : 'inativar';

    const confirmacao = await Swal.fire({
      title: "Tem certeza?",
      text: `Deseja ${action} este usuário?`,
      icon: "warning",
      showCancelButton: true,
      customClass: {
        title: 'montserrat-alternates-semibold',
        confirmButton: 'montserrat-alternates-semibold',
        cancelButton: 'montserrat-alternates-semibold',
        htmlContainer: 'montserrat-alternates-semibold'
      },
      confirmButtonColor: ativar ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sim, ${action}!`,
      cancelButtonText: "Cancelar",
    });

    if (!confirmacao.isConfirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: usuarioId }),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: "Sucesso!",
          text: data.message,
          icon: "success",
          customClass: {
            title: 'montserrat-alternates-semibold',
            confirmButton: 'montserrat-alternates-semibold',
            cancelButton: 'montserrat-alternates-semibold',
            htmlContainer: 'montserrat-alternates-semibold'
          }
        });
        onStatusChange(usuarioId, ativar);
      } else {
        await Swal.fire({
          title: "Erro!",
          text: data.message || `Não foi possível ${action} o usuário.`,
          icon: "error",
          customClass: {
            title: 'montserrat-alternates-semibold',
            confirmButton: 'montserrat-alternates-semibold',
            cancelButton: 'montserrat-alternates-semibold',
            htmlContainer: 'montserrat-alternates-semibold'
          }
        });
      }
    } catch (error) {
      console.error("Erro:", error);
      await Swal.fire({
        title: "Erro!",
        text: `Ocorreu um erro ao tentar ${action} o usuário.`,
        icon: "error",
        customClass: {
          title: 'montserrat-alternates-semibold',
          confirmButton: 'montserrat-alternates-semibold',
          cancelButton: 'montserrat-alternates-semibold',
          htmlContainer: 'montserrat-alternates-semibold'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => handleStatusChange(!ativo)}
      disabled={loading}
      className={`btn ${ativo ? 'btn-danger' : 'btn-success'}`}
      title={ativo ? 'Inativar usuário' : 'Reativar usuário'}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm"></span>
      ) : (
        <span className="material-icons">
          {ativo ? 'person' : 'person_off'}
        </span>
      )}
    </button>
  );
};

export default DeletarUsuario;
