import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";

const MostrarUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const isAllowed = usePermission(2);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);

  interface Usuario {
    id_usuario: number;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    tipo: number;
    ativo: boolean;
    imagem: string;
    imagemPreview?: string | null;
  }

  useEffect(() => {
    async function fetchImagePreview(user: Usuario) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/uploads/usuarios/${user.imagem}`,
          {
            method: "HEAD",
          }
        );
        return response.ok
          ? `http://127.0.0.1:5000/uploads/usuarios/${user.imagem}`
          : null;
      } catch {
        return null;
      }
    }

    async function fetchUsers() {
      try {
        const response = await fetch("http://127.0.0.1:5000/usuarios", {
          method: "get",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Erro ao buscar usuários");
        const data = await response.json();

        const usersWithImagePreview = await Promise.all(
          data.map(async (user: Usuario) => ({
            ...user,
            imagemPreview: await fetchImagePreview(user),
          }))
        );

        setUsers(usersWithImagePreview);
        setFilteredUsers(usersWithImagePreview);
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Não foi possível carregar os usuários. Tente novamente mais tarde.",
        });
      }
    }
    fetchUsers();
  }, []);

  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    if (pesquisa) {
      const filtered = users.filter((user) => {
        const tipoUsuario =
          user.tipo === 1
            ? "leitor"
            : user.tipo === 2
            ? "bibliotecario"
            : "administrador";

        return (
          user.id_usuario.toString().includes(pesquisa) ||
          user.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
          user.email.toLowerCase().includes(pesquisa.toLowerCase()) ||
          user.telefone.toLowerCase().includes(pesquisa.toLowerCase()) ||
          user.endereco.toLowerCase().includes(pesquisa.toLowerCase()) ||
          tipoUsuario.includes(pesquisa.toLowerCase()) ||
          (user.ativo ? "ativo" : "inativo")
            .toLowerCase()
            .includes(pesquisa.toLowerCase())
        );
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [pesquisa, users]);

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="usuarios-container">
      <i className="fa-solid fa-arrow-left arrow-back"  onClick={() => navigate("/home_biblio?page=1")}></i>
      <h1 className="page-title montserrat-alternates">Usuários</h1>
      <input 
        type="text"
        placeholder="Pesquisar usuários"
        className="input pesquisa montserrat-alternates"
        onChange={(e) => setPesquisa(e.target.value)}
      />
      <div className="usuarios-grid">
        {filteredUsers.map((user) => (
          <div key={user.id_usuario} className="usuario-card">
            {user.imagemPreview ? (
              <img
                src={user.imagemPreview}
                alt={user.nome}
                className="usuario-imagem"
              />
            ) : (
              <div className="usuario-imagem-placeholder montserrat-alternates">Sem imagem</div>
            )}
            <div className="usuario-info montserrat-alternates">
              <h3>{user.nome}</h3>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Telefone:</strong> {user.telefone}
              </p>
              <p>
                <strong>Endereço:</strong> {user.endereco}
              </p>
              <p>
                <strong>Tipo:</strong>{" "}
                {user.tipo === 1
                  ? "Leitor"
                  : user.tipo === 2
                  ? "Bibliotecário"
                  : "Administrador"}
              </p>
              <p>
                <strong>Status:</strong> {user.ativo ? "Ativo" : "Inativo"}
              </p>
              <div className="usuario-acoes">
                <button
                  onClick={() => navigate(`/usuarios/${user.id_usuario}`)}
                  className="btn btn-secondary"
                >
                  <span className="material-icons">launch</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MostrarUsuarios;
