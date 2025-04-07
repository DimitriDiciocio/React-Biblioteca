import React from "react";
import { usePermission } from "../components/usePermission";

const Relatorios: React.FC = () => {
  const isAllowed = usePermission(2);

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <div className="d-flex-column center-y center-x gap-5">
        <h1>Gerar Relatórios</h1>
        <div className="space-y-4">
          <a
            href="http://127.0.0.1:5000/relatorio/livros"
            target="_blank"
            rel="noopener noreferrer"
            className=""
          >
            Visualizar Relatório de Livros
          </a>
          <a
            href="http://127.0.0.1:5000/relatorio/usuarios"
            target="_blank"
            rel="noopener noreferrer"
            className=""
          >
            Visualizar Relatório de Usuários
          </a>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
