import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { usePermission } from "../components/usePermission";
import DeletarUsuario from "../components/DeletarUsuario";

const MostrarUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const isAllowed = usePermission(2);

  const [users, setUsers] = useState<Usuario[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  interface Filtros {
    [key: string]: string | number | boolean | undefined;
  }

  const [filtros, setFiltros] = useState<Filtros>({});

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
        { method: "HEAD" }
      );
      return response.ok
        ? `http://127.0.0.1:5000/uploads/usuarios/${user.imagem}`
        : null;
    } catch {
      return null;
    }
  }

  const fetchUsers = useCallback(
    async (pageNumber: number, pesquisaTerm: string = "", filtrosData: Filtros = {}) => {
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
            ...options,
            method: "POST",
            body: JSON.stringify({
              pesquisa: pesquisaTerm,
              filtros: filtrosData,
            }),
          };
        }

        const response = await fetch(url, options);
        if (!response.ok) {
          if (response.status === 404) setHasMore(false);
          throw new Error("Erro ao buscar usuários");
        }

        const data = await response.json();
        const resultados = data.resultados || data;

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

        setUsers((prev) => [
          ...prev,
          ...usersWithImagePreview.filter(
            (newUser) => !prev.some((u) => u.id_usuario === newUser.id_usuario)
          ),
        ]);
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      pageRef.current = 1;
      setUsers([]);
      setHasMore(true);
      fetchUsers(1, pesquisa, filtros);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [pesquisa, filtros]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.getItem("updateCadastro")) {
        setPage(1);
        pageRef.current = 1;
        setUsers([]);
        setHasMore(true);
        fetchUsers(1, pesquisa, filtros);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [pesquisa, filtros, fetchUsers]);

  useEffect(() => {
    const handleCustomUpdate = () => {
      setPage(1);
      pageRef.current = 1;
      setUsers([]);
      setHasMore(true);
      fetchUsers(1, pesquisa, filtros);
    };

    window.addEventListener("updateCadastro", handleCustomUpdate);

    return () => {
      window.removeEventListener("updateCadastro", handleCustomUpdate);
    };
  }, [pesquisa, filtros, fetchUsers]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (hasMore) {
        const nextPage = pageRef.current + 1;
        pageRef.current = nextPage;
        setPage(nextPage);
        fetchUsers(nextPage, pesquisa, filtros);
      }
    }
  }, [hasMore, pesquisa, filtros]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPesquisa(e.target.value);
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="usuarios-container">
      <i
        className="fa-solid fa-arrow-left arrow-back"
        onClick={() => navigate("/home_biblio?page=1")}
      ></i>
      <h1 className="page-title montserrat-alternates-semibold">Usuários</h1>
      <input
        type="text"
        placeholder="Pesquisar usuários"
        className="input pesquisa montserrat-alternates"
        value={pesquisa}
        onChange={handleSearchChange}
      />
      <div className="usuarios-grid">
        {users.map((user) => (
          <div key={user.id_usuario} className="usuario-card">
            {user.imagemPreview ? (
              <img
                src={user.imagemPreview}
                alt={user.nome}
                className="usuario-imagem"
              />
            ) : (
              <div className="usuario-imagem-placeholder montserrat-alternates">
                Sem imagem
              </div>
            )}
            <div className="usuario-info montserrat-alternates">
              <h3>{user.nome}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Telefone:</strong> {user.telefone}</p>
              <p><strong>Endereço:</strong> {user.endereco}</p>
              <p><strong>Tipo:</strong> {
                user.tipo === 1 ? "Leitor" :
                user.tipo === 2 ? "Bibliotecário" : "Administrador"
              }</p>
              <p><strong>Status:</strong> {user.ativo ? "Ativo" : "Inativo"}</p>
              <div className="usuario-acoes">
                <button
                  onClick={() => navigate(`/usuarios/${user.id_usuario}`)}
                  className="btn btn-secondary"
                  title="Editar Usuário"
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
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MostrarUsuarios;
