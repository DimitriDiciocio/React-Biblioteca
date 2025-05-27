import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import "../index.css";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";
import PuxarHistorico from "../components/PuxarHistorico";

const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay " style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
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

const EditarUsuario: React.FC = () => {
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
        setEndereco(data.endereco); // Set the address state

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
  }

  useEffect(() => {
    recuperaDados()
  }, [navigate, token]);

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
        // Atualiza cidades do modal para o estado atual
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
    if (
      !editNome.trim() ||
      !editEmail.trim() ||
      !editTelefone.trim() ||
      !editUf ||
      !editCidade
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha todos os campos e selecione estado e cidade antes de salvar.",
        confirmButtonText: "OK"
      });
      return;
    }

    const enderecoCompleto = `${editCidade} - ${editUf}`; // Combine city and UF
    const formData = new FormData();
    formData.append("nome", editNome);
    formData.append("email", editEmail);
    formData.append("telefone", editTelefone.replace(/\D/g, "")); // Send numeric-only
    formData.append("endereco", enderecoCompleto); // Update address field

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
          customClass: {
            title: "montserrat-alternates-semibold",
            htmlContainer: "montserrat-alternates-semibold"
          },
          title: "Usuário editado com sucesso!",
          text: data.message,
          icon: "success",
        });
        setNome(editNome);
        setEmail(editEmail);
        setTelefone(editTelefone);
        setUf(editUf);
        setCidade(editCidade);
        setEndereco(enderecoCompleto);
        setIsEditing(false);
      } else {
        Swal.fire({
          title: "Erro ao editar usuário",
          text: data.message,
          icon: "error",
          customClass: {
            title: "montserrat-alternates-semibold",
            htmlContainer: "montserrat-alternates-semibold"
          }
        });
      }
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

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="pagina-edicao-usuario ">

      <main className="background-blue">
        <section>
          <div className="banner-profile"></div>
        </section>
        <div className="usuario-layout">
          <section className="fifty-cents">
            <div className="profile-picture">
              <img
                src={imagemPreview || "../assets/img/user.png"}
                alt="Sua foto de perfil!"
                className="profile-picture-preview"
              />
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
    </div>
  );
};

export default EditarUsuario;