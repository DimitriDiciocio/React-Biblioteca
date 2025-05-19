import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";
import DeletarUsuario from "../components/DeletarUsuario";

const MostrarUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const isAllowed = usePermission(2);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtros, setFiltros] = useState({});

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

  async function fetchUsers(pageNumber: number, pesquisaTerm: string = "", filtrosData: any = {}) {
    try {
      let url = `http://127.0.0.1:5000/usuarios/${pageNumber}`;
      let options: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      if (pesquisaTerm || Object.keys(filtrosData).length > 0) {
        url = `http://127.0.0.1:5000/usuarios/pesquisa/${pageNumber}`;
        options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            pesquisa: pesquisaTerm,
            filtros: filtrosData,
          }),
        };
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 404) {
          setHasMore(false);
        }
        throw new Error("Erro ao buscar usuários");
      }
      const data = await response.json();

      const resultados = data.resultados || data; // Handle both API responses
      if (resultados.length === 0) {
        setHasMore(false);
        return;
      }

      const usersWithImagePreview = await Promise.all(
        resultados.map(async (user: Usuario) => ({
          ...user,
          imagemPreview: await fetchImagePreview(user),
        }))
      );

      setUsers((prevUsers) => {
        const newUsers = usersWithImagePreview.filter(
          (newUser) => !prevUsers.some((existingUser) => existingUser.id_usuario === newUser.id_usuario)
        );
        return [...prevUsers, ...newUsers];
      });

      setFilteredUsers((prevFiltered) => {
        const newFilteredUsers = usersWithImagePreview.filter(
          (newUser) => !prevFiltered.some((existingUser) => existingUser.id_usuario === newUser.id_usuario)
        );
        return [...prevFiltered, ...newFilteredUsers];
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchUsers(page, pesquisa, filtros);
  }, [page, pesquisa, filtros]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  }, [hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPesquisa(e.target.value);
    setPage(1);
    setUsers([]);
    setFilteredUsers([]);
    setHasMore(true);
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="usuarios-container">
      <i className="fa-solid fa-arrow-left arrow-back"  onClick={() => navigate("/home_biblio?page=1")}></i>
      <h1 className="page-title montserrat-alternates-semibold">Usuários</h1>
      <input 
        type="text"
        placeholder="Pesquisar usuários"
        className="input pesquisa montserrat-alternates"
        onChange={handleSearchChange}
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
                <DeletarUsuario
                  usuarioId={user.id_usuario}
                  ativo={user.ativo}
                  onStatusChange={(deletedId, novoStatus) => {
                    setUsers(prev => prev.map(u => 
                      u.id_usuario === deletedId ? { ...u, ativo: novoStatus } : u
                    ));
                    setFilteredUsers(prev => prev.map(u => 
                      u.id_usuario === deletedId ? { ...u, ativo: novoStatus } : u
                    ));
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMore && <p>Carregando mais usuários...</p>}
    </div>
  );
};

export default MostrarUsuarios;
