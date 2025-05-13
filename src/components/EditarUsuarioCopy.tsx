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
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAllowed = usePermission(1);

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

    const enderecoCompleto = `${cidade} - ${uf}`; // Combine city and UF
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone.replace(/\D/g, "")); // Send numeric-only
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
    setUf(originalUf); // Revert UF to original
    setCidade(originalCidade); // Revert city to original
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
        <section>
          <div className="profile-picture">
            <img
              src={imagemPreview || "../assets/img/user.png"}
              alt="Sua foto de perfil!"
              className="profile-picture-preview"
            />
            <div className="margin-btn">
              <button className="btn3 btn-primary3">
                <span className="material-icons">edit</span>
              </button>
            </div>
          </div>
          <div className="d-flex">
            <div className="info-container">
              <p className="montserrat-alternates info-profile">{nome || "Usuário"}</p>
              <p className="montserrat-alternates info-profile">{email || "Email"}</p>
              <p className="montserrat-alternates info-profile">{telefone || "Telefone"}</p>
              <p className="montserrat-alternates info-profile">{endereco || "Endereço"}</p>
            </div>
            <div>
              
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditarUsuario;