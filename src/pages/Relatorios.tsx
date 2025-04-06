import React from "react";
import { usePermission } from "../components/usePermission";

const Relatorios: React.FC = () => {
  const isAllowed = usePermission(2);

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <div className="espaco-vazio"></div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Gerar Relatórios</h1>
        <div className="space-y-4">
          <a
            href="http://127.0.0.1:5000/relatorio/livros"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Visualizar Relatório de Livros
          </a>
          <a
            href="http://127.0.0.1:5000/relatorio/usuarios"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
          >
            Visualizar Relatório de Usuários
          </a>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
