import React, { useState } from "react";
import RelatorioLivros from "./RelatorioLivros";
import RelatorioUsuarios from "../components/RelatorioUsuarios";

export default function PaginaRelatorios() {
  const [mostrar, setMostrar] = useState("livros");

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => setMostrar("livros")}
          style={{
            padding: "8px 16px",
            backgroundColor: mostrar === "livros" ? "#2473D9" : "#ccc",
            color: mostrar === "livros" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Relatório de Livros
        </button>
        <button
          onClick={() => setMostrar("usuarios")}
          style={{
            padding: "8px 16px",
            backgroundColor: mostrar === "usuarios" ? "#2473D9" : "#ccc",
            color: mostrar === "usuarios" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Relatório de Usuários
        </button>
      </div>

      <div style={{ display: mostrar === "livros" ? "block" : "none" }}>
        <RelatorioLivros />
      </div>
      <div style={{ display: mostrar === "usuarios" ? "block" : "none" }}>
        <RelatorioUsuarios />
      </div>
    </div>
  );
}
