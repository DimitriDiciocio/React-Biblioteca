import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../index.css";
import { useDropzone } from "react-dropzone";
import styles from "./Cadastro.module.css";

const Cadastro: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const tipo = "1";
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmSenha, setMostrarConfirmSenha] = useState(false);
  const [cidadesBrasil, setCidadesBrasil] = useState<string[]>([]);
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [ufsBrasil, setUfsBrasil] = useState<string[]>([]);
  const [senhaStrength, setSenhaStrength] = useState<
    "fraca" | "media" | "forte" | "invalida"
  >("invalida");
  const [nomeActive, setNomeActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);
  const [telefoneActive, setTelefoneActive] = useState(false);
  const [senhaActive, setSenhaActive] = useState(false);
  const [confirmSenhaActive, setConfirmSenhaActive] = useState(false);
  const navigate = useNavigate();

  const senhaStrengthMessages = {
    fraca:
      "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.",
    media:
      "Adicione letras maiúsculas, minúsculas e caracteres especiais para fortalecer sua senha.",
    forte: "Sua senha é forte.",
    invalida: "A senha é inválida.",
  };

  useEffect(() => {
    const fetchUfs = async () => {
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        );
        if (response.ok) {
          const data = await response.json();
          setUfsBrasil(data.map((uf: { sigla: string }) => uf.sigla));
        } else {
          console.error("Erro ao buscar UFs:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar UFs:", error);
      }
    };

    fetchUfs();
  }, []);

  useEffect(() => {
    const fetchCidades = async () => {
      if (!uf) {
        setCidadesBrasil([]);
        return;
      }

      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
        );
        if (response.ok) {
          const data = await response.json();
          setCidadesBrasil(data.map((cidade: { nome: string }) => cidade.nome));
        } else {
          console.error("Erro ao buscar cidades:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      }
    };

    fetchCidades();
  }, [uf]);

  const validateSenha = (senha: string) => {
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /\d/.test(senha);
    const temCaractEspecial = /[!@#$%^&*(),-.?":{}|<>]/.test(senha);

    if (senha.length < 8) return "fraca";
    if (temMaiuscula && temMinuscula && temNumero && temCaractEspecial)
      return "forte";
    if ((temMaiuscula || temMinuscula) && temNumero) return "media";
    return "fraca";
  };

  useEffect(() => {
    setSenhaStrength(validateSenha(senha));
  }, [senha]);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    const enderecoCompleto = `${cidade} - ${uf}`; // Combine city and UF
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone.replace(/\D/g, "")); // Send numeric-only
    formData.append("endereco", enderecoCompleto); // Update address field
    formData.append("tipo", tipo);
    formData.append("senha", senha);
    formData.append("confirmSenha", confirmSenha);

    if (imagem) {
      formData.append("imagem", imagem);
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/cadastro", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          customClass: {
            title: "montserrat-alternates-semibold",
            htmlContainer: "montserrat-alternates-semibold",
            popup: "montserrat-alternates-semibold",
            container: "montserrat-alternates-semibold",
            confirmButton: "montserrat-alternates-semibold",
            content: "montserrat-alternates-semibold",
          },
          title: "Cadastro realizado!",
          text: data.message,
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Ir para o login",
        });
        navigate("/login");
      } else {
        await Swal.fire({
          customClass: {
            title: "montserrat-alternates-semibold",
            htmlContainer: "montserrat-alternates-semibold",
            popup: "montserrat-alternates-semibold",
            container: "montserrat-alternates-semibold",
            confirmButton: "montserrat-alternates-semibold",
            content: "montserrat-alternates-semibold",
          },
          title: "Erro no cadastro",
          text: data.message,
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      await Swal.fire({
        customClass: {
          title: "montserrat-alternates-semibold",
          htmlContainer: "montserrat-alternates-semibold",
          popup: "montserrat-alternates-semibold",
          container: "montserrat-alternates-semibold",
          confirmButton: "montserrat-alternates-semibold",
          content: "montserrat-alternates-semibold",
        },
        title: "Erro de conexão!",
        text: "Não foi possível se conectar ao servidor." + String(error),
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Função para alternar a visibilidade das senhas
  const veSenha = (campo: "senha" | "confirmSenha") => {
    if (campo === "senha") {
      setMostrarSenha(!mostrarSenha);
    } else if (campo === "confirmSenha") {
      setMostrarConfirmSenha(!mostrarConfirmSenha);
    }
  };

  const formatTelefone = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 10) {
      return numericValue.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return numericValue.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImagem(file);
      setImagemPreview(URL.createObjectURL(file)); // Exibir a imagem escolhida
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleRemoveImage = () => {
    setImagem(null);
    setImagemPreview(null);
  };

  return (
    <div className="body-cadastro">
      <header className="header-login">
        <p
          className="delius-regular"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          Read Raccoon
        </p>
      </header>
      <main className="container-cadastro">
        <div
          {...getRootProps()}
          className="image-upload"
          style={{
            border: "2px dashed #ccc",
            textAlign: "center",
            cursor: "pointer",
            borderRadius: "50%",
          }}
        >
          <input {...getInputProps()} />
          {imagemPreview ? (
            <>
              <img src={imagemPreview} alt="Imagem de capa" />
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveImage();
                }}
                style={{
                  position: "absolute",
                  top: "300px",
                  right: "850px",
                  background: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                }}
                className="menor"
              >
                X
              </button>
            </>
          ) : (
            <p className="m-top-70-seminterferncia montserrat-alternates-semibold">
              Arraste uma imagem ou clique para selecionar
            </p>
          )}
        </div>
        <h2 className="h2-cadastro montserrat-alternates-semibold">Cadastro</h2>

        <form onSubmit={handleCadastro} className="d-flex-column-cadastro">
          <div className="inputGroup2">
            <input
              className={`montserrat-alternates-semibold ${styles.inputBar} ${
                nomeActive ? styles.active : ""
              } ${nome && nome.length >= 3 ? styles.complete : ""}`}
              type="text"
              required
              autoComplete="off"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onFocus={() => setNomeActive(true)}
              tabIndex={1}
            />
            <label htmlFor="name" className="montserrat-alternates-semibold">
              Nome do Usuário
            </label>
          </div>
          <div className="d-flex gap-5-responsive">
            <div>
              <div className="inputGroup">
                <input
                  className={`montserrat-alternates-semibold ${
                    styles.inputBar
                  } ${emailActive ? styles.active : ""} ${
                    email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                      ? styles.complete
                      : ""
                  }`}
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailActive(true)}
                  tabIndex={2}
                />
                <label
                  htmlFor="name"
                  className="montserrat-alternates-semibold"
                >
                  E-mail:
                </label>
              </div>
              <div className="inputGroup">
                <select
                  className={`montserrat-alternates-semibold ${
                    uf ? styles.complete : ""
                  }`}
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  required
                  tabIndex={4}
                >
                  <option value="">Estado</option>
                  {ufsBrasil.map((uf, index) => (
                    <option key={index} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inputGroup">
                <input
                  className={`montserrat-alternates-semibold ${
                    styles.inputBar
                  } ${senhaActive ? styles.active : ""} ${
                    senhaStrength === "forte" && senha ? styles.complete : ""
                  }`}
                  type={mostrarSenha ? "text" : "password"}
                  id="senha"
                  required
                  autoComplete="off"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onFocus={() => setSenhaActive(true)}
                  tabIndex={6}
                />
                <label className="montserrat-alternates-semibold">Senha:</label>
                <input
                  type="checkbox"
                  id="togglePassword"
                  checked={mostrarSenha}
                  hidden
                />
                <div className="eye-container" onClick={() => veSenha("senha")}>
                  <svg
                    className="eye"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                  >
                    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1-288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
                  </svg>
                  <svg
                    className="eye-slash"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                  >
                    <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" />
                  </svg>
                </div>
              </div>
              {senhaActive && (
                <div
                  className="senha-strength-bar"
                  style={{
                    marginTop: "5px",
                    position: "relative",
                    height: "8px",
                    width: "calc(100% - 16px)",
                    maxWidth: "360px",
                  }}
                >
                  {/* Fundo cinza sempre */}
                  <div
                    style={{
                      height: "8px",
                      borderRadius: "10px",
                      backgroundColor: "#ccc",
                      width: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 1,
                    }}
                  ></div>
                  {/* Barra colorida só se senha não está vazia */}
                  {senha ? (
                    <div
                      style={{
                        height: "8px",
                        borderRadius: "10px",
                        backgroundColor:
                          senhaStrength === "forte"
                            ? "green"
                            : senhaStrength === "media"
                            ? "orange"
                            : "red",
                        width:
                          senhaStrength === "forte"
                            ? "100%"
                            : senhaStrength === "media"
                            ? "61%"
                            : "28%",
                        transition: "width 0.3s ease",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 2,
                      }}
                    ></div>
                  ) : null}
                  {/* Tooltip */}
                  {senha && (
                    <div
                      className="tooltip"
                      style={{
                        position: "absolute",
                        top: "-25px",
                        left: "0",
                        backgroundColor: "#333",
                        color: "#fff",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        visibility: "hidden",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {senhaStrengthMessages[senhaStrength]}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <div className="inputGroup">
                <input
                  className={`montserrat-alternates-semibold ${
                    styles.inputBar
                  } ${telefoneActive ? styles.active : ""} ${
                    telefone && telefone.replace(/\D/g, "").length >= 10
                      ? styles.complete
                      : ""
                  }`}
                  type="text"
                  required
                  autoComplete="off"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  onFocus={() => setTelefoneActive(true)}
                  maxLength={15}
                  tabIndex={3}
                />
                <label
                  htmlFor="name"
                  className="montserrat-alternates-semibold"
                >
                  Telefone:
                </label>
              </div>
              <div className="inputGroup">
                <select
                  className={`montserrat-alternates-semibold ${
                    cidade ? styles.complete : ""
                  }`}
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                  disabled={!uf}
                  tabIndex={5}
                >
                  <option value="">Cidade</option>
                  {cidadesBrasil.map((cidade, index) => (
                    <option key={index} value={cidade}>
                      {cidade}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inputGroup">
                <input
                  className={`montserrat-alternates-semibold ${
                    styles.inputBar
                  } ${confirmSenhaActive ? styles.active : ""} ${
                    confirmSenha && confirmSenha === senha && senha
                      ? styles.complete
                      : ""
                  }`}
                  type={mostrarConfirmSenha ? "text" : "password"}
                  id="senha-confirm"
                  required
                  autoComplete="off"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  onFocus={() => setConfirmSenhaActive(true)}
                  tabIndex={7}
                />
                <label className="montserrat-alternates-semibold">
                  Confirmar Senha:
                </label>
                <input
                  type="checkbox"
                  id="togglePassword-confirm"
                  checked={mostrarConfirmSenha}
                  hidden
                />
                <div
                  className="eye-container"
                  onClick={() => veSenha("confirmSenha")}
                >
                  <svg
                    className="eye-confirm"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                  >
                    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1-288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
                  </svg>
                  <svg
                    className="eye-slash-confirm"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                  >
                    <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="button-login montserrat-alternates-semibold"
            >
              Cadastrar
            </button>
            <div className="space-lilsm-y"></div>
            <a
              className="register text-decoration-none cursor-pointer montserrat-alternates-semibold"
              onClick={() => navigate("/login")}
            >
              Possuo uma conta
            </a>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Cadastro;

/*
.senha-strength-bar:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
*/
