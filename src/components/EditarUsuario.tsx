import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import "../index.css";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";

const EditarUsuario: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalNome, setOriginalNome] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalTelefone, setOriginalTelefone] = useState("");
  const [originalEndereco, setOriginalEndereco] = useState("");
  const [cidadesBrasil, setCidadesBrasil] = useState<string[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAllowed = usePermission(1);

  const formatTelefone = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 10) {
      return numericValue.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return numericValue.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const isValidImage = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setNome(data.nome);
          setEmail(data.email);
          setTelefone(formatTelefone(data.telefone)); // Format for display
          setEndereco(data.endereco);

          // Save original values
          setOriginalNome(data.nome);
          setOriginalEmail(data.email);
          setOriginalTelefone(formatTelefone(data.telefone));
          setOriginalEndereco(data.endereco);

          if (data.imagem) {
            const imagemUrl = `http://127.0.0.1:5000/uploads/usuarios/${data.imagem}`;

            fetch(imagemUrl)
              .then(async (imgResponse) => {
                if (imgResponse.ok) {
                  setImagemPreview(imagemUrl);

                  // Convert the image URL to a File object
                  const blob = await imgResponse.blob();
                  const file = new File([blob], data.imagem, {
                    type: blob.type,
                  });
                  setImagem(file); // Set the image file
                }
              })
              .catch(() => {
                console.log("Imagem não encontrada");
              });
          }
        } else {
          Swal.fire({
            title: "Erro ao buscar dados do usuário",
            text: data.message,
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Erro de conexão com o servidor",
          text: String(error),
          icon: "error",
        });
      }
    };

    fetchUserData();
  }, [navigate, token]);

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImagem(file);
      setImagemPreview(URL.createObjectURL(file));
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

  const handleEdicao = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone.replace(/\D/g, "")); // Send numeric-only
    formData.append("endereco", endereco);

    if (imagem) {
      formData.append("imagem", imagem);
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/editar_usuario`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Usuário editado com sucesso!",
          text: data.message,
          icon: "success",
        });
        setIsEditing(false);
      } else {
        Swal.fire("Erro ao editar usuário", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Erro de conexão com o servidor", String(error), "error");
    }
  };

  const handleCancel = () => {
    setNome(originalNome);
    setEmail(originalEmail);
    setTelefone(originalTelefone);
    setEndereco(originalEndereco);
    setIsEditing(false);
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="pagina-edicao-usuario ">
      <div className="space-xxbig-y"></div>

      <main className="background-blue">
        <section className="d-flex center-x size-medium g-30 ">
          {isEditing ? (
            <div>
              <div
                {...getRootProps()}
                className="dropzone border-book4"
                style={{
                  borderRadius: "50%",
                  width: "300px",
                  height: "300px",
                  position: "relative",
                  borderStyle: "dashed",
                  padding: "0",
                }}
              >
                <input {...getInputProps()} />
                {imagemPreview ? (
                  <>
                    <img
                      src={imagemPreview || undefined}
                      alt="Imagem de perfil"
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
          ) : (
            <div
              className="dropzone border-book4"
              style={{
                borderRadius: "50%",
                width: "300px",
                height: "300px",
                position: "relative",
                borderStyle: "dashed",
                padding: "0",
              }}
            >
              {imagemPreview && isValidImage(imagemPreview) && (
                <img
                  src={imagemPreview}
                  alt="Imagem de perfil"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          )}

          <div>
            {!isEditing ? (
              <div className="w-656">
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Nome:
                  </label>
                  <p className="montserrat-alternates">{nome}</p>
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Email:
                  </label>
                  <p className="montserrat-alternates">{email}</p>
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Telefone:
                  </label>
                  <p className="montserrat-alternates">{telefone}</p>
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Endereço:
                  </label>
                  <p className="montserrat-alternates">{endereco}</p>
                </div>

                <div className="d-flex g-sm m-top">
                  <button
                    type="button"
                    className="salvar montserrat-alternates-semibold"
                    onClick={() => setIsEditing(true)}
                  >
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEdicao} className="w-656">
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Nome:
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="input montserrat-alternates-semibold"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input montserrat-alternates-semibold"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Telefone:
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) =>
                      setTelefone(formatTelefone(e.target.value))
                    }
                    className="input montserrat-alternates-semibold"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Endereço:
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="input montserrat-alternates-semibold"
                    list="cidades"
                    required
                  />
                  <datalist id="cidades">
                    {cidadesBrasil.map((cidade, index) => (
                      <option key={index} value={cidade} />
                    ))}
                  </datalist>
                </div>

                <div className="d-flex g-sm m-top">
                  <button
                    type="button"
                    className="salvar cancelar montserrat-alternates-semibold"
                    onClick={handleCancel}
                  >
                    <span>Cancelar</span>
                  </button>
                  <button
                    type="submit"
                    className="salvar montserrat-alternates-semibold"
                  >
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditarUsuario;
