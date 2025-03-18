import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../Header";
import Swal from "sweetalert2"

const Relatorios = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  
  useEffect(() => {
    const tokenIsActive = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/token", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.error || "Erro na verificação do token");
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        navigate("/login");
      }
    };

    tokenIsActive();
  }, [navigate, token]);

  useEffect(() => {
    const temPermissao = async () => {

      try {
        const response = await fetch("http://127.0.0.1:5000/tem_permissao", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const result = await response.json();

        if (!response.ok) {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: result.error || "Essa pagina é restrita",
          });
        }
      } catch (error) {
        console.error("Essa página é restrita:", error);
        navigate(-1)
      }
    };

    temPermissao();
  }, [navigate, token]);

  return (
    <div>
      <Header/>
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
    </div>
  );
};

export default Relatorios;