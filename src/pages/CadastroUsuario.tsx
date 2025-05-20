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
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [tipo, setTipo] = useState(1);
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [cidadesBrasil, setCidadesBrasil] = useState<string[]>([]);
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [ufsBrasil, setUfsBrasil] = useState<string[]>([]);
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

    const enderecoCompleto = `${cidade} - ${uf}`;
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone.replace(/\D/g, ""));
    formData.append("endereco", enderecoCompleto);
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

        // Buscar a imagem do usuário recém-cadastrado
        let imagemPreviewUrl = null;
        if (data.usuario && data.usuario.imagem) {
          try {
            const imageResponse = await fetch(
              `http://127.0.0.1:5000/uploads/usuarios/${data.usuario.imagem}`,
              { method: "HEAD" }
            );
            if (imageResponse.ok) {
              imagemPreviewUrl = `http://127.0.0.1:5000/uploads/usuarios/${data.usuario.imagem}`;
            }
          } catch (error) {
            console.error("Erro ao buscar imagem do usuário:", error);
          }
        }

        // Resetar os campos do formulário
        setNome("");
        setEmail("");
        setTelefone("");
        setSenha("");
        setConfirmSenha("");
        setTipo(1);
        setImagem(null);
        setImagemPreview(null);
        setUf("");
        setCidade("");
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
    setSenha("");
    setConfirmSenha("");
    setTipo(1);
    setImagem(null);
    setImagemPreview(null);
    setUf("");
    setCidade("");
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

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="pagina-edicao-usuario">

      <main className="background-blue">
        <section className="center-x size-medium d-flex-column-no-font">
          <i className="fa-solid fa-arrow-left arrow-back"  onClick={() => navigate("/home_biblio?page=1")}></i>
          <div className="d-flex center-x">
            <div
              {...getRootProps()}
              className="dropzone border-book4"
              style={{
                borderRadius: "50%",
                width: "150px",
                height: "150px",
                position: "static",
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
                      position: "relative",
                      top: "-35vw",
                      right: "-30vw",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    X
                  </button>
                </>
              ) : (
                <div className="dz-message pointer">
                  <p>Arraste ou clique para selecionar</p>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex center-x m-home-biblio">
            <form onSubmit={handleCadastro}>
              <div className="d-flex g-sm">
                <div className="column1-form">
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
                      maxLength={15}
                    />
                  </div>
                  <div className="form-group">
                    <label className="montserrat-alternates-semibold">
                      Estado (UF):
                    </label>
                    <select
                      className="input montserrat-alternates-semibold"
                      value={uf}
                      onChange={(e) => setUf(e.target.value)}
                      required
                    >
                      <option value="">Selecione o estado</option>
                      {ufsBrasil.map((uf, index) => (
                        <option key={index} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
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
                </div>
                <div className="column2-form">
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
                  <div className="form-group">
                    <label className="montserrat-alternates-semibold">
                      Cidade:
                    </label>
                    <select
                      className="input montserrat-alternates-semibold"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      required
                      disabled={!uf}
                    >
                      <option value="">Selecione a cidade</option>
                      {cidadesBrasil.map((cidade, index) => (
                        <option key={index} value={cidade}>
                          {cidade}
                        </option>
                      ))}
                    </select>
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
                </div>
              </div>



              <div className="d-flex g-sm m-top center-x">
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
                  <span>Limpar</span>
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
