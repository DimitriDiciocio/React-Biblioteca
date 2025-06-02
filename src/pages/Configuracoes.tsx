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
  // Library data is now part of configuracoes
  const [configuracoes, setConfiguracoes] = useState({
    dias_validade_emprestimo: "",
    dias_validade_emprestimo_buscar: "",
    limite_emprestimos: "",
    limite_reservas: "",
    chave_pix: "",
    razao_social: "",
    endereco: "",
    telefone: "",
    email: "",
  });

  const [originais, setOriginais] = useState({
    valor_base: 0,
    valor_acrescimo: 0,
    dias_validade_emprestimo: 0,
    dias_validade_emprestimo_buscar: 0,
    limite_emprestimos: 0,
    limite_reservas: 0,
    chave_pix: "",
    razao_social: "",
    endereco: "",
    telefone: "",
    email: "",
  });
  interface HistoricoConfiguracao {
    dias_validade_emprestimo?: number;
    dias_validade_emprestimo_buscar?: number;
    limite_emprestimos?: number;
    limite_reservas?: number;
    chave_pix?: string;
    razao_social?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    data_adicionado?: string;
    [key: number]: string | number | undefined;
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
      }); // Fetch current configurations
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
          dias_validade_emprestimo: config[1]?.toString() || "",
          dias_validade_emprestimo_buscar: config[2]?.toString() || "",
          chave_pix: config[3]?.toString() || "",
          razao_social: config[4]?.toString() || "",
          endereco: config[5]?.toString() || "",
          telefone: config[6]?.toString() || "",
          email: config[7]?.toString() || "",
          limite_emprestimos: config[8]?.toString() || "",
          limite_reservas: config[9]?.toString() || "",
        });
        setOriginais((prev) => ({
          ...prev,
          dias_validade_emprestimo:
            parseInt(config.dias_validade_emprestimo || config[1]) || 0,
          dias_validade_emprestimo_buscar:
            parseInt(config.dias_validade_emprestimo_buscar || config[2]) || 0,
          chave_pix: config[3]?.toString() || "",
          razao_social: config[4]?.toString() || "",
          endereco: config[5]?.toString() || "",
          telefone: config[6]?.toString() || "",
          email: config[7]?.toString() || "",
          limite_emprestimos: parseInt(config[8]) || 0,
          limite_reservas: parseInt(config[9]) || 0,
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
          config.map((item: { [key: number]: number | string }) => ({
            dias_validade_emprestimo: item[1],
            dias_validade_emprestimo_buscar: item[2],
            chave_pix: item[3] || "",
            razao_social: item[4] || "",
            endereco: item[5] || "",
            telefone: item[6] || "",
            email: item[7] || "",
            limite_emprestimos: item[8] || "",
            limite_reservas: item[9] || "",
            data_adicionado: item[10] || "",
          }))
        );
      })
      .catch((error) => {
        console.error("Erro ao buscar histórico de configurações:", error);
      }); // Library data is now part of configuracoes
  }, [isAllowed]);

  if (isAllowed === false) {
    return null;
  }
  const validatePhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const numericOnly = phone.replace(/\D/g, "");
    // Check if it has 10 or 11 digits (with DDD)
    return numericOnly.length >= 10 && numericOnly.length <= 11;
  };

  const formatTelefone = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const cursorPosition = value.length - 1;
    if (value[cursorPosition] === "-" || value[cursorPosition] === ")") {
      return value.slice(0, cursorPosition);
    }
    if (numericValue.length <= 10) {
      return numericValue.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return numericValue.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add phone validation for Pix key and remove formatting
    const pixNumerico = configuracoes.chave_pix.replace(/\D/g, "");
    const telefoneNumerico = configuracoes.telefone.replace(/\D/g, "");
    
    if (!validatePhoneNumber(pixNumerico)) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "A chave Pix deve ser um número de telefone válido (com DDD).",
      });
      return;
    }

    const valorBase = parseFloat(valores.valor_base) || 0;
    const valorAcrescimo = parseFloat(valores.valor_acrescimo) || 0;
    const valoresAlterados =
      valorBase !== originais.valor_base ||
      valorAcrescimo !== originais.valor_acrescimo;
    const configAlterada =
      parseInt(configuracoes.dias_validade_emprestimo) !==
        originais.dias_validade_emprestimo ||
      parseInt(configuracoes.dias_validade_emprestimo_buscar) !==
        originais.dias_validade_emprestimo_buscar ||
      configuracoes.chave_pix !== originais.chave_pix ||
      configuracoes.razao_social !== originais.razao_social ||
      configuracoes.endereco !== originais.endereco ||
      configuracoes.telefone !== originais.telefone ||
      configuracoes.email !== originais.email ||
      parseInt(configuracoes.limite_emprestimos) !== originais.limite_emprestimos ||
      parseInt(configuracoes.limite_reservas) !== originais.limite_reservas;

    if (!valoresAlterados && !configAlterada) {
      Swal.fire({
        icon: "warning",
        title: "Nada alterado",
        text: "Altere algum valor antes de atualizar as configurações.",
      });
      return;
    }
    // Validação dos campos obrigatórios
    if (
      configAlterada &&
      (!configuracoes.razao_social ||
        !configuracoes.chave_pix ||
        !configuracoes.endereco ||
        !configuracoes.telefone ||
        !configuracoes.email)
    ) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Todos os campos da biblioteca são obrigatórios.",
      });
      return;
    }
    if (valoresAlterados && (valorBase < 0 || valorAcrescimo < 0)) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Os valores numéricos não podem ser menores ou iguais a 0.",
      });
      return;
    }
    if (
      configAlterada &&
      (parseInt(configuracoes.dias_validade_emprestimo) <= 0 ||
        parseInt(configuracoes.dias_validade_emprestimo_buscar) <= 0)
    ) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Os valores numéricos não podem ser menores ou iguais a 0.",
      });
      return;
    }
    try {
      const resConfig = await fetch("http://127.0.0.1:5000/configuracoes/criar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dias_validade_emprestimo: parseInt(configuracoes.dias_validade_emprestimo),
          dias_validade_buscar: parseInt(configuracoes.dias_validade_emprestimo_buscar),
          chave_pix: pixNumerico,
          razao_social: configuracoes.razao_social,
          endereco: configuracoes.endereco,
          telefone: telefoneNumerico,
          email: configuracoes.email,
          limite_emprestimo: parseInt(configuracoes.limite_emprestimos),
          limite_reserva: parseInt(configuracoes.limite_reservas),
        }),
      });
      if (!resConfig.ok) throw new Error("Erro ao atualizar configurações");

      setOriginais({
        valor_base: parseFloat(valores.valor_base) || 0,
        valor_acrescimo: parseFloat(valores.valor_acrescimo) || 0,
        dias_validade_emprestimo: parseInt(configuracoes.dias_validade_emprestimo) || 0,
        dias_validade_emprestimo_buscar: parseInt(configuracoes.dias_validade_emprestimo_buscar) || 0,
        chave_pix: configuracoes.chave_pix,
        razao_social: configuracoes.razao_social,
        endereco: configuracoes.endereco,
        telefone: configuracoes.telefone,
        email: configuracoes.email,
        limite_emprestimos: parseInt(configuracoes.limite_emprestimos) || 0,
        limite_reservas: parseInt(configuracoes.limite_reservas) || 0,
      });

      Swal.fire({
        icon: "success",
        title: "Sucesso",
        text: "Configurações atualizadas com sucesso!",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao atualizar configurações.",
      });
      console.error("Erro ao atualizar configurações:", error);
    }
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
              value={configuracoes.dias_validade_emprestimo_buscar}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  dias_validade_emprestimo_buscar: e.target.value,
                })
              }
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Limite de Empréstimos</label>
            <input
              type="number"
              value={configuracoes.limite_emprestimos}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  limite_emprestimos: e.target.value,
                })
              }
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Limite de Reservas</label>
            <input
              type="number"
              value={configuracoes.limite_reservas}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  limite_reservas: e.target.value,
                })
              }
              className={styles.input}
              required
            />
          </div>

          <h3 className={styles.subtitle}>Configurações da Biblioteca</h3>
          <div className={styles.inputGroup}>
            <label>Razão Social</label>
            <input
              type="text"
              value={configuracoes.razao_social}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  razao_social: e.target.value,
                })
              }
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Chave Pix (Telefone com DDD)</label>
            <input
              type="text"
              value={configuracoes.chave_pix}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  chave_pix: formatTelefone(e.target.value),
                })
              }
              maxLength={15}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Endereço</label>
            <input
              type="text"
              value={configuracoes.endereco}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
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
              value={configuracoes.telefone}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  telefone: formatTelefone(e.target.value),
                })
              }
              maxLength={15}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={configuracoes.email}
              onChange={(e) =>
                setConfiguracoes({
                  ...configuracoes,
                  email: e.target.value,
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
                  <th>Limite Empréstimos</th>
                  <th>Limite Reservas</th>
                  <th>Razão Social</th>
                  <th>Chave Pix</th>
                  <th>Email</th>
                  <th>Data Adicionado</th>
                </tr>
              </thead>
              <tbody>
                {historicoConfiguracoes.map((config, index) => (
                  <tr key={index}>
                    <td>{config.dias_validade_emprestimo || "N/A"}</td>
                    <td>{config.dias_validade_emprestimo_buscar || "N/A"}</td>
                    <td>{config.limite_emprestimos || "N/A"}</td>
                    <td>{config.limite_reservas || "N/A"}</td>
                    <td>{config.razao_social || "N/A"}</td>
                    <td>{config.chave_pix || "N/A"}</td>
                    <td>{config.email || "N/A"}</td>
                    <td>
                      {config.data_adicionado ? config.data_adicionado : "N/A"}
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
    </div>
  );
};

export default Configuracoes;
