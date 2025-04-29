import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./Configuracoes.module.css";

const Configuracoes: React.FC = () => {
  const [valores, setValores] = useState({
    valor_base: "",
    valor_acrescimo: "",
  });
  const [originais, setOriginais] = useState({
    valor_base: 0,
    valor_acrescimo: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current values from the API
    fetch("http://127.0.0.1:5000/valores", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar valores");
        }
        return response.json();
      })
      .then((data) => {
        const { valor_base, valor_acrescimo } = data;
        setValores({
          valor_base: parseFloat(valor_base).toFixed(2), // Ensure two decimal places
          valor_acrescimo: parseFloat(valor_acrescimo).toFixed(2), // Ensure two decimal places
        });
        setOriginais({
          valor_base: parseFloat(valor_base),
          valor_acrescimo: parseFloat(valor_acrescimo),
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar valores:", error);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valorBase = parseFloat(valores.valor_base) || 0;
    const valorAcrescimo = parseFloat(valores.valor_acrescimo) || 0;

    if (valorBase < 0 || valorAcrescimo < 0) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Os valores não podem ser menores que 0.",
      });
      return;
    }

    if (
      valorBase === originais.valor_base &&
      valorAcrescimo === originais.valor_acrescimo
    ) {
      Swal.fire({
        icon: "info",
        title: "Nenhuma alteração detectada",
        text: "Os valores inseridos são iguais aos atuais.",
      });
      return;
    }

    fetch("http://127.0.0.1:5000/valor/criar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valor_base: valorBase,
        valor_acrescimo: valorAcrescimo,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao atualizar valores");
        }
        return response.json();
      })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Sucesso",
          text: "Valores atualizados com sucesso!",
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Erro ao atualizar valores.",
        });
        console.error("Erro ao atualizar valores:", error);
      });
  };

  return (
    <div className={styles.container}>
      <i className="fa-solid fa-arrow-left arrow-back"  onClick={() => navigate("/home_biblio?page=1")}></i>
      <h2 className={styles.title}>Configurações</h2>
      <p className={styles.description}>
        Ajuste as configurações do sistema aqui.
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h3 className={styles.subtitle}>Atualizar Valores</h3>
        <div className={styles.inputGroup}>
          <label>Valor Base</label>
          <label className={styles.inputLabel}>
            R$
            <input
              type="number"
              value={valores.valor_base}
              onChange={(e) =>
                setValores({
                  ...valores,
                  valor_base: e.target.value,
                })
              }
              className={styles.input}
              step={0.01}
              required
            />
          </label>
        </div>
        <div className={styles.inputGroup}>
          <label>Valor Acrescimo</label>
          <label className={styles.inputLabel}>
            R$
            <input
              type="number"
              value={valores.valor_acrescimo}
              onChange={(e) =>
                setValores({
                  ...valores,
                  valor_acrescimo: e.target.value,
                })
              }
              className={styles.input}
              required
              step={0.01}
            />
          </label>
        </div>
        <button type="submit" className={styles.button}>
          Atualizar
        </button>
      </form>
    </div>
  );
};

export default Configuracoes;
