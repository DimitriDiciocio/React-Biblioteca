import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import EmprestimoPorUsuario from "../components/EmprestimoPorUsuario";
import Usuarios from "../components/Usuarios";
import DeletarUsuario from "../components/DeletarUsuario";
import Header from "../components/Header";

const DetalhesUsuario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  interface User {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    tipo: number;
    ativo: boolean;
    imagem: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Erro ao buscar usuário");
        const data = await response.json();
        setUser(data);
        if (data.imagem) {
          const imagemUrl = `http://127.0.0.1:5000/uploads/usuarios/${data.imagem}`;
      
          fetch(imagemUrl)
            .then(async (imgResponse) => {
              if (imgResponse.ok) {
                setImagemPreview(imagemUrl);
              }
            })
            .catch(() => {
              console.log("Imagem não encontrada");
            });
        }

      } catch (error) {
        console.error(error);
        Swal.fire(
          "Erro!",
          "Não foi possível carregar os dados do usuário.",
          "error"
        );
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <p>Carregando...</p>;

  const imageUrl = `http://127.0.0.1:5000/uploads/usuarios/${user.imagem}`;

  const isValidImage = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  return (
    <div>
      <Header />
      <button
        onClick={() => navigate("/home_biblio?page=3")}
        style={{
          marginBottom: "20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
        }}
      >
        &lt;
      </button>
      <h1>Detalhes do Usuário</h1>
      <div className="actions">
        <DeletarUsuario
          usuarioId={id ? parseInt(id, 10) : 0}
          onDeleteSuccess={() => navigate("/home_biblio?page=3")}
        />
      </div>
      {isEditing ? (
        <Usuarios onCancel={() => setIsEditing(false)} />
      ) : (
        <div className="pagina-edicao-usuario">
          <main className="background-blue">
            <section className="d-flex center-x size-medium g-30">
              <div>
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
                      src={imageUrl}
                      alt={user.nome}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="w-656">
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Nome:
                  </label>
                  <p className="">{user.nome}</p>
                </div>
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Email:
                  </label>
                  <p className="">{user.email}</p>
                </div>
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Telefone:
                  </label>
                  <p className="">{user.telefone}</p>
                </div>
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Endereço:
                  </label>
                  <p className="">{user.endereco}</p>
                </div>
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Tipo:
                  </label>
                  <p className="">
                    {user.tipo === 1
                      ? "Usuário"
                      : user.tipo === 2
                      ? "Bibliotecário"
                      : "Administrador"}
                  </p>
                </div>
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Status:
                  </label>
                  <p className="">{user.ativo ? "Ativo" : "Inativo"}</p>
                </div>
                <div className="d-flex g-sm m-top">
                  <button
                    type="button"
                    className="salvar cancelar montserrat-alternates-semibold"
                    onClick={() => setIsEditing(true)}
                  >
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            </section>
          </main>
          <h2>Empréstimos</h2>
          {id && <EmprestimoPorUsuario userId={id} />}
        </div>
      )}
    </div>
  );
};

export default DetalhesUsuario;
