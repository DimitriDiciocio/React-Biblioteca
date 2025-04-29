import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RelatorioLivros from "../components/RelatorioLivros";
import RelatorioUsuarios from "../components/RelatorioUsuarios";
import RelatorioMultas from "../components/RelatorioMultas";

export default function PaginaRelatorios() {
  const [mostrar, setMostrar] = useState("livros");
  const navigate = useNavigate();

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <i className="fa-solid fa-arrow-left arrow-back"  onClick={() => navigate("/home_biblio?page=1")}></i>
      <div className="space-sm-y"></div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setMostrar("livros")}
          className="montserrat-alternates"
          style={{
            padding: "8px 3px",
            backgroundColor: mostrar === "livros" ? "#2473D9" : "#ccc",
            color: mostrar === "livros" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Relatório de Livros
        </button>
        <button
          onClick={() => setMostrar("usuarios")}
          className="montserrat-alternates"
          style={{
            padding: "8px 3px",
            backgroundColor: mostrar === "usuarios" ? "#2473D9" : "#ccc",
            color: mostrar === "usuarios" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Relatório de Usuários
        </button>
        <button
          className="montserrat-alternates"
          onClick={() => setMostrar("multas")}
          style={{
            padding: "8px 3px",
            backgroundColor: mostrar === "multas" ? "#2473D9" : "#ccc",
            color: mostrar === "multas" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Relatório de Multas
        </button>
      </div>

      <div style={{ display: mostrar === "livros" ? "block" : "none" }}>
        <RelatorioLivros />
      </div>
      <div style={{ display: mostrar === "usuarios" ? "block" : "none" }}>
        <RelatorioUsuarios />
      </div>
      <div style={{ display: mostrar === "multas" ? "block" : "none" }}>
        <RelatorioMultas />
      </div>
    </div>
  );
}
