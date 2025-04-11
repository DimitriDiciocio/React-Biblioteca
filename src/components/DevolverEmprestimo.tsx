import React from "react";
import { useNavigate } from "react-router-dom";
import { handleDevolverEmprestimo } from "./DevolverEmprestimo";

interface DevolverEmprestimoProps {
  id: string;
  onReturnSuccess: () => void;
}

const DevolverEmprestimo: React.FC<DevolverEmprestimoProps> = ({
  id,
  onReturnSuccess,
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <button
        className="salvar montserrat-alternates-semibold"
        onClick={() => handleDevolverEmprestimo(id, navigate, onReturnSuccess)}
      >
        <span>Devolver Empréstimo</span>
      </button>
    </div>
  );
};

export default DevolverEmprestimo;
