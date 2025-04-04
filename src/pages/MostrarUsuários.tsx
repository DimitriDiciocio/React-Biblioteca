import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../Header";

const MostrarUsuarios: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Ajuste inicial para false

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

  useEffect(() => {
    const temPermissao = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/tem_permissao", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          navigate("/");
        }
      } catch (error) {
        console.error("Essa página é restrita:", error);
        navigate("/");
      }
    };

    temPermissao();
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

  const handleEdit = (usuario: Usuario) => {
    const url = `/usuarios/${usuario.id_usuario}`;
    window.location.href = url;
  };

  const handleDelete = async (usuario: Usuario) => {
    const confirmacao = await Swal.fire({
      title: "Tem certeza?",
      text: "Essa ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacao.isConfirmed) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/deletar_usuario", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id_usuario: usuario.id_usuario }), // Enviando como JSON
      });

      if (response.ok) {
        await Swal.fire(
          "Deletado!",
          "O usuário foi removido com sucesso.",
          "success"
        );
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id_usuario !== usuario.id_usuario)
        );
        setFilteredUsers((prevFiltered) =>
          prevFiltered.filter((user) => user.id_usuario !== usuario.id_usuario)
        );
      } else {
        await Swal.fire("Erro!", "Não foi possível excluir o usuário.", "error");
      }
    } catch (error) {
      console.error("Erro:", error);
      await Swal.fire(
        "Erro!",
        "Ocorreu um erro ao tentar excluir o usuário.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

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
          (user.ativo ? "Ativo" : "Inativo")
            .toLowerCase()
            .includes(pesquisa.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [pesquisa, users]);

  return (
    <div>
      <Header />

      <div className="espaco-vazio"></div>

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
                <td>{user.tipo === 1 ? "Leitor" : user.tipo === 2 ? "Bibliotecário" : "Administrador"}</td>
                <td>{user.ativo ? "Ativo" : "Inativo"}</td>
                <td className="gap-botao">
                  <button
                    onClick={() => handleEdit(user)}
                    className="btn btn-primary"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={loading}
                    className="btn btn-danger"
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <span className="material-icons">delete</span>
                    )}
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
