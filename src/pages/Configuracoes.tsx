import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";
import { formatDate } from "../services/FormatDate";
import styles from "./Configuracoes.module.css";

const Configuracoes: React.FC = () => {
  const [valores, setValores] = useState({
    valor_base: "",
    valor_acrescimo: "",
  });

  const [configuracoes, setConfiguracoes] = useState({
    dias_validade_emprestimo: "",
    dias_validade_buscar: "",
    dias_validade_reserva: "",
    dias_validade_reserva_atender: "",
  });

  const [originais, setOriginais] = useState({
    valor_base: 0,
    valor_acrescimo: 0,
    dias_validade_emprestimo: 0,
    dias_validade_buscar: 0,
    dias_validade_reserva: 0,
    dias_validade_reserva_atender: 0,
  });

  interface HistoricoConfiguracao {
    dias_validade_emprestimo?: number;
    dias_validade_buscar?: number;
    dias_validade_reserva?: number;
    dias_validade_reserva_atender?: number;
    data_adicionado?: string;
  }

  const [historicoConfiguracoes, setHistoricoConfiguracoes] = useState<
    HistoricoConfiguracao[]
  >([]);
  const [activeTab, setActiveTab] = useState("configuracoes");

  const isAllowed = usePermission(3); // Check if the user is an admin
  const navigate = useNavigate();

  useEffect(() => {
    if (isAllowed === false) {
      return; // Prevent fetching data if the user is not allowed
    }

    // Fetch current values for multas
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
          valor_base: parseFloat(valor_base).toFixed(2),
          valor_acrescimo: parseFloat(valor_acrescimo).toFixed(2),
        });
        setOriginais((prev) => ({
          ...prev,
          valor_base: parseFloat(valor_base),
          valor_acrescimo: parseFloat(valor_acrescimo),
        }));
      })
      .catch((error) => {
        console.error("Erro ao buscar valores:", error);
      });

    // Fetch current configurations
    fetch("http://127.0.0.1:5000/configuracoes?todas=false", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar configurações");
        }
        return response.json();
      })
      .then((data) => {
        const config = data.configuracoes_mais_recentes;
        setConfiguracoes({
          dias_validade_emprestimo: config[1],
          dias_validade_buscar: config[2],
          dias_validade_reserva: config[4],
          dias_validade_reserva_atender: config[3],
        });
        setOriginais((prev) => ({
          ...prev,
          dias_validade_emprestimo: config[1],
          dias_validade_buscar: config[2],
          dias_validade_reserva: config[4],
          dias_validade_reserva_atender: config[3],
        }));
      })
      .catch((error) => {
        console.error("Erro ao buscar configurações:", error);
      });

    // Fetch configuration history
    fetch("http://127.0.0.1:5000/configuracoes?todas=true", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar histórico de configurações");
        }
        return response.json();
      })
      .then((data) => {
        const config = data.configuracoes;
        setHistoricoConfiguracoes(
          config.map((item: { [key: number]: number }) => ({
            dias_validade_emprestimo: item[1],
            dias_validade_buscar: item[2],
            dias_validade_reserva: item[3],
            dias_validade_reserva_atender: item[4],
            data_adicionado: item[5],
          }))
        );
      })
      .catch((error) => {
        console.error("Erro ao buscar histórico de configurações:", error);
      });
  }, [isAllowed]);

  if (isAllowed === false) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valorBase = parseFloat(valores.valor_base) || 0;
    const valorAcrescimo = parseFloat(valores.valor_acrescimo) || 0;

    if (
      valorBase < 0 ||
      valorAcrescimo < 0 ||
      Object.values(configuracoes).some((val) => parseInt(val) <= 0)
    ) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Os valores não podem ser menores ou iguais a 0.",
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
        return fetch("http://127.0.0.1:5000/configuracoes/criar/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configuracoes),
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao atualizar configurações");
        }
        return response.json();
      })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Sucesso",
          text: "Configurações atualizadas com sucesso!",
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Erro ao atualizar configurações.",
        });
        console.error("Erro ao atualizar configurações:", error);
      });
  };

  return (
    <div className={styles.container}>
      <i
        className="fa-solid fa-arrow-left arrow-back"
        onClick={() => navigate("/home_biblio?page=1")}
      ></i>
      <h2 className={styles.title}>Configurações</h2>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "configuracoes" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("configuracoes")}
        >
          Configurações
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "historico" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("historico")}
        >
          Histórico
        </button>
      </div>
      {activeTab === "configuracoes" && (
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
          <h3 className={styles.subtitle}>Configurações Gerais</h3>
          <div className={styles.inputGroup}>
            <label>Dias de Validade do Empréstimo</label>
            <input
              type="number"
              value={configuracoes.dias_validade_emprestimo}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  dias_validade_emprestimo: e.target.value,
                })
              }
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Dias de Validade para Buscar Empréstimo</label>
            <input
              type="number"
              value={configuracoes.dias_validade_buscar}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  dias_validade_buscar: e.target.value,
                })
              }
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Dias de Validade da Reserva</label>
            <input
              type="number"
              value={configuracoes.dias_validade_reserva}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  dias_validade_reserva: e.target.value,
                })
              }
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Dias de Validade para Atender Reserva</label>
            <input
              type="number"
              value={configuracoes.dias_validade_reserva_atender}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  dias_validade_reserva_atender: e.target.value,
                })
              }
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.button}>
            Atualizar
          </button>
        </form>
      )}
      {activeTab === "historico" && (
        <div className={styles.historico}>
          <h3 className={styles.subtitle}>Histórico de Configurações</h3>
          {historicoConfiguracoes && historicoConfiguracoes.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Dias Empréstimo</th>
                  <th>Dias Buscar</th>
                  <th>Dias Reserva</th>
                  <th>Dias Atender Reserva</th>
                  <th>Data Adicionado</th>
                </tr>
              </thead>
              <tbody>
                {historicoConfiguracoes.map((config, index) => (
                  <tr key={index}>
                    <td>{config.dias_validade_emprestimo || "N/A"}</td>
                    <td>{config.dias_validade_buscar || "N/A"}</td>
                    <td>{config.dias_validade_reserva || "N/A"}</td>
                    <td>{config.dias_validade_reserva_atender || "N/A"}</td>
                    <td>
                      {config.data_adicionado
                        ? formatDate(config.data_adicionado)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noData}>Nenhum histórico encontrado.</p>
          )}
        </div>
      )}
      {isAllowed && (
        <button
          className={styles.button}
          onClick={() => navigate("/cadastro_biblioteca")}
        >
          Cadastrar Biblioteca
        </button>
      )}
    </div>
  );
};

export default Configuracoes;
