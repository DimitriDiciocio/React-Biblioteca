import React from "react";
import { useNavigate } from 'react-router-dom';

const Relatorios = () => {
  const navigate = useNavigate();

    const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login'); // Redireciona para a página de login se não houver token
        }

  const handleDownload = async (tipo:string) => {

    try {
      const response = await fetch(`/relatorio/${tipo}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar relatório");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_${tipo}.pdf`;
      a.click();
    } catch (error) {
      console.error("Erro ao baixar relatório:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Gerar Relatórios</h1>
      <div className="space-y-4">
        <a
          href="http://127.0.0.1:5000/relatorio/livros"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Baixar Relatório de Livros
        </a>
        <a
          href="http://127.0.0.1:5000/relatorio/usuarios"
          className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
        >
          Baixar Relatório de Usuários
        </a>
      </div>
    </div>
  );
};

export default Relatorios;