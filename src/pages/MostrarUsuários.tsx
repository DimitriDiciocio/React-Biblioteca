import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const MostrarUsuarios: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const tokenIsActive = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          Swal.fire(
            "Erro",
            result.error || "Erro na verificação do token",
            "error"
          );
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        navigate("/login");
      }
    };

    tokenIsActive();
  }, [navigate, token]);

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

  const handleOpenBook = (usuario: Usuario) => {
    const url = `/usuarios/${usuario.id_usuario}`;
    window.location.href = url;
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("http://127.0.0.1:5000/usuarios");
        if (!response.ok) throw new Error("Erro ao buscar usuários");
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchUsers();
  }, []);

  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    if (pesquisa) {
      const filtered = users.filter(
        (user) =>
            user.id_usuario.toString().includes(pesquisa) ||
            user.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
            user.email.toLowerCase().includes(pesquisa.toLowerCase()) ||
            user.telefone.toLowerCase().includes(pesquisa.toLowerCase()) ||
            user.endereco.toLowerCase().includes(pesquisa.toLowerCase()) ||
            (user.ativo ? "Ativo" : "Inativo").toLowerCase().includes(pesquisa.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [pesquisa, users]);

  return (
    <div>
      <h1>Usuários</h1>
      <input
        type="text"
        placeholder="Pesquisar usuários"
        onChange={(e) => setPesquisa(e.target.value)}
      />
      <div className="d-flex rolagem">
        {filteredUsers.map((user, index) => {
          const imageUrl = `http://127.0.0.1:5000/uploads/usuarios/${user.imagem}`;

          return (
            <div
              key={index}
              className="livro col-12"
              onClick={() => handleOpenBook(user)}
              style={{ cursor: "pointer" }}
            >
              <img src={imageUrl} alt="" />
              <p className="nome-livro">{user.id_usuario}</p>
              <p className="nome-livro">{user.nome}</p>
              <p className="nome-livro">{user.email}</p>
              <p className="nome-livro">{user.telefone}</p>
              <p className="nome-livro">{user.endereco}</p>
              <p className="nome-livro">{user.tipo}</p>
              <p className="nome-livro">{user.ativo ? "Ativo" : "Inativo"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MostrarUsuarios;
