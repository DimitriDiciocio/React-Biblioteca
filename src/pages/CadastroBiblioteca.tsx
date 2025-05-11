import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";
import styles from "./CadastroBiblioteca.module.css";

const CadastroBiblioteca: React.FC = () => {
  const [dadosBiblioteca, setDadosBiblioteca] = useState({
    razao_social: "",
    chave_pix: "",
    endereco: "",
    telefone: "",
    email: "",
    horario_funcionamento: "",
  });

  const isAllowed = usePermission(3); // Check if the user is an admin
  const navigate = useNavigate();

  if (isAllowed === false) {
    return null; // Prevent rendering if the user is not allowed
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !dadosBiblioteca.razao_social ||
      !dadosBiblioteca.chave_pix ||
      !dadosBiblioteca.endereco ||
      !dadosBiblioteca.telefone ||
      !dadosBiblioteca.email ||
      !dadosBiblioteca.horario_funcionamento
    ) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Todos os campos são obrigatórios.",
      });
      return;
    }

    fetch("http://127.0.0.1:5000/biblioteca/cadastrar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosBiblioteca),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao cadastrar biblioteca");
        }
        return response.json();
      })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Sucesso",
          text: "Dados da biblioteca cadastrados com sucesso!",
        });
        navigate("/home_biblio?page=1");
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Erro ao cadastrar biblioteca.",
        });
        console.error("Erro ao cadastrar biblioteca:", error);
      });
  };

  return (
    <div className={styles.container}>
      <i
        className="fa-solid fa-arrow-left arrow-back"
        onClick={() => navigate("/home_biblio?page=1")}
      ></i>
      <h2 className={styles.title}>Cadastro da Biblioteca</h2>
      <p className={styles.description}>
        Insira as informações institucionais da biblioteca.
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Razão Social</label>
          <input
            type="text"
            value={dadosBiblioteca.razao_social}
            onChange={(e) =>
              setDadosBiblioteca({
                ...dadosBiblioteca,
                razao_social: e.target.value,
              })
            }
            className={styles.input}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Chave Pix</label>
          <input
            type="text"
            value={dadosBiblioteca.chave_pix}
            onChange={(e) =>
              setDadosBiblioteca({
                ...dadosBiblioteca,
                chave_pix: e.target.value,
              })
            }
            className={styles.input}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Endereço</label>
          <input
            type="text"
            value={dadosBiblioteca.endereco}
            onChange={(e) =>
              setDadosBiblioteca({
                ...dadosBiblioteca,
                endereco: e.target.value,
              })
            }
            className={styles.input}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Telefone</label>
          <input
            type="text"
            value={dadosBiblioteca.telefone}
            onChange={(e) =>
              setDadosBiblioteca({
                ...dadosBiblioteca,
                telefone: e.target.value,
              })
            }
            className={styles.input}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Email</label>
          <input
            type="email"
            value={dadosBiblioteca.email}
            onChange={(e) =>
              setDadosBiblioteca({
                ...dadosBiblioteca,
                email: e.target.value,
              })
            }
            className={styles.input}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Horário de Funcionamento</label>
          <input
            type="text"
            value={dadosBiblioteca.horario_funcionamento}
            onChange={(e) =>
              setDadosBiblioteca({
                ...dadosBiblioteca,
                horario_funcionamento: e.target.value,
              })
            }
            className={styles.input}
            required
          />
        </div>
        <button type="submit" className={styles.button}>
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default CadastroBiblioteca;
