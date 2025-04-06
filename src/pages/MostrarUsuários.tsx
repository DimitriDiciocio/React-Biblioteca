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
  }

  useEffect(() => {
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
        setUsers(data);
        setFilteredUsers(data);
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
    <div>
      <h1>Usuários</h1>
      <input
        type="text"
        placeholder="Pesquisar usuários"
        onChange={(e) => setPesquisa(e.target.value)}
      />

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Endereço</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => {
            return (
              <tr key={user.id_usuario}>
                <td>{user.id_usuario}</td>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.telefone}</td>
                <td>{user.endereco}</td>
                <td>
                  {user.tipo === 1
                    ? "Leitor"
                    : user.tipo === 2
                    ? "Bibliotecário"
                    : "Administrador"}
                </td>
                <td>{user.ativo ? "Ativo" : "Inativo"}</td>
                <td className="gap-botao">
                  <button
                    onClick={() => navigate(`/usuarios/${user.id_usuario}`)}
                    className="btn btn-secondary"
                  >
                    <span className="material-icons">launch</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MostrarUsuarios;
