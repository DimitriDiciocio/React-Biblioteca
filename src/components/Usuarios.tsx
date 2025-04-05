import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { usePermission } from "./usePermission";
import EmprestimoPorUsuario from "./EmprestimoPorUsuario";
import DeletarUsuario from "./DeletarUsuario";
import { useDropzone } from "react-dropzone";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  tipo: number;
  ativo: boolean;
  imagem: string;
}

const Usuarios: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<Usuario>({
    id: 0,
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    tipo: 0,
    ativo: false,
    imagem: "",
  });

  const [ativo, setAtivo] = useState(user.ativo);
  const [tipo, setTipo] = useState(user.tipo);
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [telefone, setTelefone] = useState(user.telefone);
  const [endereco, setEndereco] = useState(user.endereco);
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState("");
  const isAllowed = usePermission(3);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(`http://127.0.0.1:5000/user/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUser(data);
      setNome(data.nome);
      setEmail(data.email);
      setTelefone(data.telefone);
      setEndereco(data.endereco);
      setTipo(data.tipo);
      setAtivo(data.ativo);
    };

    fetchUserData();
  }, [id, token]);

  useEffect(() => {
    setImagemPreview(`http://127.0.0.1:5000/uploads/usuarios/${user.imagem}`);
  }, [user.imagem]);

  const [texto, setTexto] = useState("");
  useEffect(() => {
    if (ativo) {
      setTexto("reativar_usuario");
    } else {
      setTexto("inativar_usuario");
    }
  }, [ativo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone);
    formData.append("endereco", endereco);
    formData.append("tipo", tipo.toString());

    if (imagem) {
      formData.append("imagem", imagem);
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/editar_usuario/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire(
          "Sucesso",
          result.message || "Usuário atualizado com sucesso!",
          "success"
        );
        navigate("/usuarios");
      } else {
        Swal.fire(
          "Erro",
          result.message || "Erro ao atualizar usuário",
          "error"
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/${texto}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Status atualizado com sucesso", result.error);
        navigate("/usuarios");
      } else {
        console.error("Erro ao atualizar status:", result.error);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(); // Notify parent to exit editing mode
    }
  };

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
    setImagemPreview("");
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <div className="pagina-edicao-usuario">
        <main className="background-blue">
          <section className="d-flex center-x size-medium g-30">
            <div>
              <div
                {...getRootProps()}
                className="border-book4 dropzone"
                id="dropzone"
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
                    src={imagemPreview}
                    alt="Imagem de perfil"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    />
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveImage();
                      }}
                      style={{
                        position: "absolute",
                        top: "0px",
                        right: "0px",
                        background: "rgba(0, 0, 0, 0.5)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                      }}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <div className="dz-message">
                    <p>
                      Arraste e solte a capa do livro aqui ou clique para
                      selecionar
                    </p>
                  </div>
                )}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="w-656">
              <div className="form-group">
                <label className="montserrat-alternates-semibold">Nome:</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input montserrat-alternates-semibold"
                  required
                />
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">Email:</label>
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
                  onChange={(e) => setTelefone(e.target.value)}
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
                  required
                />
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">Tipo:</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(Number(e.target.value))}
                  className="input montserrat-alternates-semibold"
                >
                  <option value="1">Usuário</option>
                  <option value="2">Bibliotecário</option>
                  <option value="3">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">
                  Status:
                </label>
                <select
                  value={ativo ? "true" : "false"}
                  onChange={(e) => setAtivo(e.target.value === "true")}
                  className="input montserrat-alternates-semibold"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
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
          </section>
        </main>
        <h2>Empréstimos</h2>
        {id && <EmprestimoPorUsuario userId={id} />}
        <div className="actions">
          <DeletarUsuario
            usuarioId={id ? parseInt(id, 10) : 0}
            onDeleteSuccess={() => navigate("/usuarios")}
          />
        </div>
      </div>
    </div>
  );
};

export default Usuarios;
