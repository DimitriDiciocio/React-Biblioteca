import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../index.css";
import { usePermission } from "../components/usePermission";
import { useDropzone } from "react-dropzone";

const CadastroUsuario: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [tipo, setTipo] = useState(1);
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [cidadesBrasil, setCidadesBrasil] = useState<string[]>([]);
  const navigate = useNavigate();
  const isAllowed = usePermission(3);

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

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone.replace(/\D/g, "")); // Remove formatting
    formData.append("endereco", endereco);
    formData.append("senha", senha);
    formData.append("confirmSenha", confirmSenha);
    formData.append("tipo", tipo.toString());

    if (imagem) {
      formData.append("imagem", imagem);
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/cadastro", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        await Swal.fire({
          title: "Erro no cadastro",
          text: data.message,
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } else {
        await Swal.fire({
          title: "Cadastro realizado com sucesso",
          text: data.message,
          icon: "success",
        });
        // Clear form fields and reset image preview
        setNome("");
        setEmail("");
        setTelefone("");
        setEndereco("");
        setSenha("");
        setConfirmSenha("");
        setTipo(1);
        setImagem(null);
        setImagemPreview(null);
      }
    } catch (error) {
      await Swal.fire({
        title: "Erro de conexão!",
        text: "Não foi possível se conectar ao servidor." + String(error),
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
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
    setImagemPreview(null);
    setImagem(null);
  };

  const handleCancelar = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setEndereco("");
    setSenha("");
    setConfirmSenha("");
    setTipo(1);
    setImagem(null);
    setImagemPreview(null);
  };

  useEffect(() => {
    const fetchCidades = async () => {
      if (endereco.trim().length === 0) {
        setCidadesBrasil([]);
        return;
      }

      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
        );
        if (response.ok) {
          const data = await response.json();
          setCidadesBrasil(
            data
              .map(
                (cidade: {
                  nome: string;
                  microrregiao: { mesorregiao: { UF: { sigla: string } } };
                }) =>
                  `${cidade.nome} - ${cidade.microrregiao.mesorregiao.UF.sigla}`
              )
              .filter((cidade: string) =>
                cidade.toLowerCase().includes(endereco.toLowerCase())
              )
              .slice(0, 8)
          );
        } else {
          console.error("Erro ao buscar cidades:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      }
    };

    fetchCidades();
  }, [endereco]);

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="pagina-edicao-usuario">
      <div className="space-med-y"></div>

      <main className="background-blue">
        <section className="d-flex center-x size-medium g-30">
          <div>
            <div
              {...getRootProps()}
              className="dropzone border-book4"
              style={{
                borderRadius: "50%",
                width: "450px",
                height: "450px",
                position: "relative",
                borderStyle: "dashed",
                padding: "0",
              }}
            >
              <input {...getInputProps()} />
              {imagemPreview ? (
                <>
                  <img
                    src={imagemPreview}
                    alt="Imagem de capa"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    X
                  </button>
                </>
              ) : (
                <div className="dz-message">
                  <p>Arraste ou clique para selecionar</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <form onSubmit={handleCadastro} className="w-656">
              <div className="form-group">
                <label className="montserrat-alternates-semibold">Nome:</label>
                <input
                  className="input montserrat-alternates-semibold"
                  type="text"
                  name="nome"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">Email:</label>
                <input
                  className="input montserrat-alternates-semibold"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">
                  Telefone:
                </label>
                <input
                  className="input montserrat-alternates-semibold"
                  type="text"
                  name="telefone"
                  placeholder="Telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">
                  Endereço:
                </label>
                <input
                  className="input montserrat-alternates-semibold"
                  type="text"
                  name="endereco"
                  placeholder="Endereço"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  list="cidades"
                  required
                />
                <datalist id="cidades">
                  {cidadesBrasil.map((cidade, index) => (
                    <option key={index} value={cidade} />
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">Senha:</label>
                <input
                  className="input montserrat-alternates-semibold"
                  type="password"
                  name="senha"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">
                  Confirmar Senha:
                </label>
                <input
                  className="input montserrat-alternates-semibold"
                  type="password"
                  name="confirmSenha"
                  placeholder="Confirmar Senha"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">Tipo:</label>
                <select
                  className="input montserrat-alternates-semibold"
                  value={tipo}
                  onChange={(e) => setTipo(Number(e.target.value))}
                  required
                >
                  <option value="1">Usuário</option>
                  <option value="2">Bibliotecário</option>
                  <option value="3">Administrador</option>
                </select>
              </div>
              <div className="d-flex g-sm m-top">
                <button
                  type="submit"
                  className="salvar montserrat-alternates-semibold"
                >
                  <span>Cadastrar</span>
                </button>
                <button
                  type="button"
                  className="salvar cancelar montserrat-alternates-semibold"
                  onClick={handleCancelar}
                >
                  <span>Cancelar</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CadastroUsuario;
