import React from "react";
import styles from "../pages/Movimentacoes.module.css";

interface UsuarioFaltando {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  // Adicione mais campos se quiser mostrar mais informações
}

interface ModalUsuariosFaltandoProps {
  open: boolean;
  onClose: () => void;
  usuarios: UsuarioFaltando[];
  onNavigate: (id: number) => void;
}

const ModalUsuariosFaltando: React.FC<ModalUsuariosFaltandoProps> = ({ open, onClose, usuarios, onNavigate }) => {
  if (!open) return null;
  return (
    <div
      className="modal-data"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 32,
          minWidth: 320,
          maxWidth: 400,
          width: "100%",
          position: "relative",
          zIndex: 100000,
          fontFamily: 'Montserrat Alternates, Montserrat, Arial, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
          }}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 style={{ marginBottom: 16 }}>Usuários com este livro</h2>
        {usuarios.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888" }}>Nenhum usuário encontrado.</div>
        ) : (
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {usuarios.map((usuario) => (
              <li
                key={usuario.id}
                style={{
                  marginBottom: 12,
                  padding: 8,
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{ color: "#2473D9", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => onNavigate(usuario.id)}
                >
                  {usuario.nome}
                </span>
                {usuario.email && (
                  <span style={{ fontSize: 13, color: "#555" }}>Email: {usuario.email}</span>
                )}
                {usuario.telefone && (
                  <span style={{ fontSize: 13, color: "#555" }}>Telefone: {usuario.telefone}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ModalUsuariosFaltando;
