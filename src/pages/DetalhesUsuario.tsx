import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import "../index.css";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission.ts";
import PuxarHistorico from "../components/PuxarHistorico";
import Header from "../components/Header"; // <-- adicionado

const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay " style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900,
      overflow: "hidden" // impede scroll na overlay
    }}
      onClick={onClose}
    >
      <div className="modal-content" style={{
        background: "#fff", borderRadius: 10, padding: 32, minWidth: 320, maxWidth: 400, width: "100%", position: "relative"
      }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: "absolute", top: 10, right: 10, background: "none", border: "none", fontSize: 22, cursor: "pointer"
        }} aria-label="Fechar">×</button>
        {children}
      </div>
    </div>
  );
};



const DetalhesUsuario: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalNome, setOriginalNome] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalTelefone, setOriginalTelefone] = useState("");
  const [cidadesBrasil, setCidadesBrasil] = useState<string[]>([]);
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [ufsBrasil, setUfsBrasil] = useState<string[]>([]);
  const [endereco, setEndereco] = useState("");
  const [originalEndereco, setOriginalEndereco] = useState("");
  const [originalUf, setOriginalUf] = useState("");
  const [originalCidade, setOriginalCidade] = useState("");
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editUf, setEditUf] = useState("");
  const [editCidade, setEditCidade] = useState("");
  const [editCidadesBrasil, setEditCidadesBrasil] = useState<string[]>([]); // cidades para o modal
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAllowed = usePermission(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImagemOpen, setModalImagemOpen] = useState(false);

  // Novo estado para preview temporário no modal
  const [imagemTemp, setImagemTemp] = useState<File | null>(null);
  const [imagemTempPreview, setImagemTempPreview] = useState<string | null>(null);

  const { id } = useParams(); // <-- pega o id do usuário da URL

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

  const isValidImage = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  async function recuperaDados() {
    try {
      // Use a mesma rota que Usuarios.tsx usa: /user/:id
      const response = await fetch(`http://127.0.0.1:5000/user/${id}`, {
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
        setTelefone(formatTelefone(data.telefone));
        setEndereco(data.endereco);

        setOriginalNome(data.nome);
        setOriginalEmail(data.email);
        setOriginalTelefone(formatTelefone(data.telefone));
        setOriginalEndereco(data.endereco);

        if (data.imagem) {
          const imagemUrl = `http://127.0.0.1:5000/uploads/usuarios/${data.imagem}`;
          setImagemPreview(imagemUrl);
          setImagem(null);
        } else {
          setImagemPreview(null);
          setImagem(null);
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
  }

  useEffect(() => {
    recuperaDados()
  }, [id, navigate, token]); // <-- adiciona id como dependência

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

  useEffect(() => {
    if (endereco) {
      const [cidadePart, ufPart] = endereco.split(" - ");
      setCidade(cidadePart || "");
      setUf(ufPart || "");
      setOriginalUf(ufPart || ""); // Save original UF
      setOriginalCidade(cidadePart || ""); // Save original city
    }
  }, [endereco]);

  useEffect(() => {
    if (modalOpen) {
      setEditNome(nome);
      setEditEmail(email);
      setEditTelefone(telefone);
      setEditUf(uf);
      setEditCidade(cidade);

      if (uf) {
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
          .then(res => res.ok ? res.json() : [])
          .then(data => setEditCidadesBrasil(Array.isArray(data) ? data.map((c: { nome: string }) => c.nome) : []));
      } else {
        setEditCidadesBrasil([]);
      }
    }
  }, [modalOpen, nome, email, telefone, uf, cidade]);

  useEffect(() => {
    if (editUf) {
      const fetchCidades = async () => {
        try {
          const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${editUf}/municipios`
          );
          if (response.ok) {
            const data = await response.json();
            setEditCidadesBrasil(data.map((cidade: { nome: string }) => cidade.nome));
          } else {
            setEditCidadesBrasil([]);
          }
        } catch {
          setEditCidadesBrasil([]);
        }
      };
      fetchCidades();
    } else {
      setEditCidadesBrasil([]);
      setEditCidade(""); // Limpa cidade ao trocar estado
    }
  }, [editUf]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImagemTemp(file);
      setImagemTempPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleRemoveImage = () => {
    setImagemTemp(null);
    setImagemTempPreview(null); // Deixe null para mostrar a imagem padrão
  };

  const handleEdicao = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", editNome || nome);
    formData.append("email", editEmail || email);
    formData.append("telefone", editTelefone.replace(/\D/g, "") || telefone.replace(/\D/g, ""));
    formData.append("endereco", `${editCidade} - ${editUf}`);

    try {
      const response = await fetch(`http://127.0.0.1:5000/editar_usuario/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          title: "Erro ao editar usuário",
          text: data.message,
          icon: "error",
          customClass: {
            title: "montserrat-alternates-semibold",
            htmlContainer: "montserrat-alternates-semibold",
          },
        });
        return;
      }

      Swal.fire({
        customClass: {
          title: "montserrat-alternates-semibold",
          htmlContainer: "montserrat-alternates-semibold",
        },
        title: "Usuário editado com sucesso!",
        text: data.message,
        icon: "success",
      });

      // Update state with new values
      setNome(editNome);
      setEmail(editEmail);
      setTelefone(editTelefone);
      setUf(editUf);
      setCidade(editCidade);
      setEndereco(`${editCidade} - ${editUf}`);
      setIsEditing(false);
    } catch (error) {
      Swal.fire("Erro de conexão com o servidor", String(error), "error");
    }
  };

  const handleCancel = () => {
    setEditNome(nome);
    setEditEmail(email);
    setEditTelefone(telefone);
    setEditUf(uf); // Revert UF to original
    setEditCidade(cidade); // Revert city to original
    setIsEditing(false);
  };

  // Quando abrir o modal de imagem, sincronize o preview temporário com o atual
  useEffect(() => {
    if (modalImagemOpen) {
      // Mostra sempre a imagem atual no modal, mesmo que não tenha sido alterada
      setImagemTemp(null);
      setImagemTempPreview(imagemPreview || null);
    }
  }, [modalImagemOpen, imagemPreview]);

  const handleSalvarImagem = async () => {
    try {
      const formData = new FormData();

      if (imagemTemp) {
        // If a new image is uploaded, send it
        formData.append("imagem", imagemTemp);
      } else if (imagemPreview) {
        // Convert imagemPreview to a File object and send it
        const response = await fetch(imagemPreview);
        const blob = await response.blob();
        const file = new File([blob], "imagem_atual.jpg", { type: blob.type });
        formData.append("imagem", file);
      }

      const response = await fetch(`http://127.0.0.1:5000/upload/usuario/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImagem(imagemTemp || null);
        setImagemPreview(imagemTempPreview || null);
        Swal.fire({
          icon: "success",
          title: imagemTemp || imagemPreview ? "Imagem atualizada!" : "Imagem removida!",
          text: data.message || "Sua imagem foi alterada com sucesso.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao atualizar imagem",
          text: data.message || "Não foi possível atualizar a imagem.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: String(error),
      });
    }

    setModalImagemOpen(false);
  };

  // Impede scroll na página inteira quando DetalhesUsuario está montado
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <Header />
      {/* Seta de voltar, agora embaixo do cabeçalho */}
      <button
        onClick={() => navigate("/home_biblio?page=3")}
        style={{
          position: "absolute",
          top: 110, // logo abaixo do header fixo de 100px
          left: 18,
          zIndex: 2000,
          background: "rgba(255,255,255,0.95)",
          border: "none",
          borderRadius: "50%",
          width: 48,
          height: 48,
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 0.2s"
        }}
        title="Voltar"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#2473d9" />
          <path d="M14.5 7L10 12L14.5 17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="pagina-edicao-usuario ">

        <main className="background-blue">
          <section>
            <div className="banner-profile"></div>
          </section>
          <div className="usuario-layout">
            <section className="fifty-cents">
              <div className="profile-picture" style={{ position: "relative" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagemPreview || "../assets/img/user.png"}
                    alt="Sua foto de perfil!"
                    className="profile-picture-preview"
                    onClick={() => setModalImagemOpen(true)}
                    style={{ cursor: "pointer" }}
                  />
                  {/* Ícone de lápis branco centralizado */}
                  <svg
                    className="edit-icon-pfp"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                    width={48}
                    height={48}
                    viewBox="0 0 48 48"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 34.5V42h7.5l22.13-22.13-7.5-7.5L6 34.5Zm33.71-19.04c.39-.39.39-1.02 0-1.41l-4.76-4.76a.9959.9959 0 0 0-1.41 0l-3.54 3.54 7.5 7.5 3.54-3.54Z"/>
                  </svg>
                </div>
                <span
                  className="material-icons edit-pfp"
                  aria-hidden="true"
                >
                  edit
                </span>
                <div className="margin-btn">
                  <button className="btn3 btn-primary3" onClick={() => setModalOpen(true)}>
                    <span className="material-icons">edit</span>
                  </button>
                </div>
              </div>
              <div className="d-flex">
                <div className="info-container">
                  <p className="montserrat-alternates info-profile-name">{nome || "Usuário"}</p>
                  <p className="montserrat-alternates info-profile">{email || "Email"}</p>
                  <p className="montserrat-alternates info-profile">{telefone || "Telefone"}</p>
                  <p className="montserrat-alternates info-profile">{endereco || "Endereço"}</p>
                </div>
              </div>
            </section>
            <PuxarHistorico />
          </div>
        </main>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleEdicao(e);
              setModalOpen(false);
            }}
          >
            <h2 className="montserrat-alternates-semibold" style={{ marginBottom: 16 }}>Editar Usuário</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label className="montserrat-alternates-semibold">
                <p className="table-row">
                  Nome:
                </p>
                <input
                  className="input montserrat-alternates-semibold"
                  type="text"
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  required
                />
              </label>
              <label className="montserrat-alternates-semibold">
                <p className="table-row">
                  Email:
                </p>
                <input
                  className="input"
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  required
                />
              </label>
              <label className="montserrat-alternates-semibold">
                <p className="table-row">
                  Telefone:
                </p>
                <input
                  className="input"
                  type="text"
                  value={editTelefone}
                  onChange={e => setEditTelefone(formatTelefone(e.target.value))}
                  required
                />
              </label>
              <label className="montserrat-alternates-semibold">
                <p className="table-row">
                  Estado:
                </p>
                <select
                  className="input montserrat-alternates-semibold"
                  value={editUf}
                  onChange={e => setEditUf(e.target.value)}
                  required
                >
                  <option value="">Selecione o estado</option>
                  {ufsBrasil.map((sigla) => (
                    <option key={sigla} value={sigla}>{sigla}</option>
                  ))}
                </select>
              </label>
              <label className="montserrat-alternates-semibold">
                <p className="table-row">
                  Cidade:
                </p>
                <select
                  className="input"
                  value={editCidade}
                  onChange={e => setEditCidade(e.target.value)}
                  required
                  disabled={!editUf || editCidadesBrasil.length === 0}
                >
                  <option value="">Selecione a cidade</option>
                  {editCidadesBrasil.map((nomeCidade) => (
                    <option key={nomeCidade} value={nomeCidade}>{nomeCidade}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary montserrat-alternates-semibold"
                onClick={() => {
                  handleCancel();
                  setModalOpen(false);
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary montserrat-alternates-semibold"
                disabled={!editUf || !editCidade}
              >
                Salvar
              </button>
            </div>
          </form>
        </Modal>

        <Modal open={modalImagemOpen} onClose={() => setModalImagemOpen(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSalvarImagem();
            }}
          >
            <h2 className="montserrat-alternates-semibold" style={{ marginBottom: 16 }}>Alterar Imagem</h2>
            <div
              {...getRootProps()}
              style={{
                border: "3px dashed #ccc",
                padding: 20,
                borderRadius: 10,
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 5
              }}
            >
              <input {...getInputProps()} />
              <p className="montserrat-alternates">Arraste ou clique para enviar nova imagem</p>
              <img
                src={imagemTempPreview || "../assets/img/user.png"}
                alt="Preview"
                className="edit-image-pfp"
              />
            </div>
            <button
              type="button"
              className="montserrat-alternates"
              onClick={handleRemoveImage}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
                marginBottom: 16,
                padding: 0
              }}
            >
              Remover Imagem
            </button>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="submit"
                className="montserrat-alternates-semibold btn-big"
              >
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default DetalhesUsuario;