import React, { useState } from "react";
import Swal from "sweetalert2";

const TrocarSenha: React.FC = () => {
  const [etapa, setEtapa] = useState<"verificar" | "trocar">("verificar");
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [carregando, setCarregando] = useState(false);

  const mostrarAlerta = (
    titulo: string,
    texto: string,
    icone: "error" | "success"
  ) => {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icone,
      confirmButtonColor: "#3085d6",
    });
  };

  const verificarSenhaAntiga = async () => {
    if (!senhaAntiga) {
      mostrarAlerta("Erro", "Por favor, insira sua senha atual.", "error");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch(
        "http://127.0.0.1:5000/verificar_senha_antiga",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ senhaAntiga }),
        }
      );

      const dados = await resposta.json();

      if (resposta.ok && dados.valido) {
        setEtapa("trocar");
      } else {
        mostrarAlerta(
          "Erro",
          "Senha atual incorreta. Tente novamente.",
          "error"
        );
      }
    } catch {
      mostrarAlerta(
        "Erro",
        "Erro ao verificar a senha. Tente novamente mais tarde.",
        "error"
      );
    } finally {
      setCarregando(false);
    }
  };

  const trocarSenha = async () => {
    if (!senhaNova || !senhaConfirm) {
      mostrarAlerta("Erro", "Por favor, preencha todos os campos.", "error");
      return;
    }

    if (senhaNova !== senhaConfirm) {
      mostrarAlerta(
        "Erro",
        "As senhas não coincidem. Tente novamente.",
        "error"
      );
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch("http://127.0.0.1:5000/editar_senha", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          senha: senhaNova,
          senhaConfirm: senhaConfirm,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        mostrarAlerta("Sucesso", "Senha alterada com sucesso!", "success");
        setEtapa("verificar");
        setSenhaAntiga("");
        setSenhaNova("");
        setSenhaConfirm("");
      } else {
        mostrarAlerta(
          "Erro",
          dados.message || "Erro ao trocar a senha. Tente novamente.",
          "error"
        );
      }
    } catch {
      mostrarAlerta(
        "Erro",
        "Erro na requisição. Tente novamente mais tarde.",
        "error"
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="security-container">
      <h2 className="size-medium">
        {etapa === "verificar"
          ? "Verifique sua senha atual"
          : "Troque sua senha"}
      </h2>

      {etapa === "verificar" ? (
        <>
          <input
            type="password"
            placeholder="Senha atual"
            className="input"
            value={senhaAntiga}
            onChange={(e) => setSenhaAntiga(e.target.value)}
          />
          <button
            onClick={verificarSenhaAntiga}
            className="salvar"
            disabled={carregando}
          >
            <span>{carregando ? "Verificando..." : "Verificar"}</span>
          </button>
        </>
      ) : (
        <>
          <input
            type="password"
            placeholder="Nova senha"
            className="input"
            value={senhaNova}
            onChange={(e) => setSenhaNova(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            className="input"
            value={senhaConfirm}
            onChange={(e) => setSenhaConfirm(e.target.value)}
          />
          <button
            onClick={trocarSenha}
            className="salvar"
            disabled={carregando}
          >
            <span>{carregando ? "Salvando..." : "Trocar Senha"}</span>
          </button>
        </>
      )}
    </div>
  );
};

export default TrocarSenha;
