import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { usePermission } from "../components/usePermission";
import { useState, useEffect } from "react";
import MostrarUsuarios from "./MostrarUsuários";
import Livros from "./Livros";
import Movimentacoes from "./Movimentacoes";
import Configuracoes from "./Configuracoes";
import AddBooks from "./AddBooks";
import CadastroUsuario from "./CadastroUsuario";
import Relatorios from "./Relatorios";

const HomeBiblio: React.FC = () => {
  const navigate = useNavigate();
  const isAllowed = usePermission(2);
  const [search, setSearch] = useState("");
  const page = Number(new URLSearchParams(window.location.search).get("page"));
  const [hasAdminPermission, setHasAdminPermission] = useState(false);
  const [isPermissionChecked, setIsPermissionChecked] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      try {
        const response = await fetch("http://127.0.0.1:5000/tem_permissao/3", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const responseData = await response.json();

        if (response.ok) {
          setHasAdminPermission(true);
        } else {
          if (responseData.verificacao === 4) {
            setHasAdminPermission(false);
          } else if (
            responseData.verificacao === 1 ||
            responseData.verificacao === 2 ||
            responseData.verificacao === 3
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
          }
        }
      } catch {
        setHasAdminPermission(false);
      } finally {
        setIsPermissionChecked(true);
      }
    }

    checkPermission();
  }, [navigate]);

  useEffect(() => {
    switchPage(page);
  }, [page]);

  const switchPage = (page: number) => {
    document.querySelectorAll(".nav-lateral li").forEach((li) => {
      li.querySelector("a")?.classList.remove("active");
    });

    const activeNavItem = document.querySelector(`.nav-lateral li[data-page="${page}"] a`);
    if (activeNavItem) activeNavItem.classList.add("active");

    document.querySelectorAll(".page").forEach((pageElement) => {
      pageElement.classList.remove("active");
    });

    const activePage = document.querySelector(`.page[data-page="${page}"]`);
    if (activePage) activePage.classList.add("active");
  };

  const filteredButtons = [
    hasAdminPermission && {
      title: "Cadastrar Usuário",
      description: "Aqui você pode cadastrar um novo usuário",
      onClick: () => switchPage(2),
    },
    hasAdminPermission && {
      title: "Gerenciar Usuários",
      description: "Aqui você pode ver a lista de usuários e editar suas informações",
      onClick: () => switchPage(3),
    },
    {
      title: "Cadastrar Livro",
      description: "Aqui você pode cadastrar um novo livro na Libris",
      onClick: () => switchPage(4),
    },
    {
      title: "Gerenciar Livros",
      description: "Aqui você pode ver os livros e editar suas informações",
      onClick: () => switchPage(5),
    },
    {
      title: "Movimentações",
      description: "Aqui você pode acompanhar as movimentações da biblioteca",
      onClick: () => switchPage(6),
    },
    {
      title: "Relatórios",
      description: "Aqui você poderá gerar um relatório dos usuários e livros no formato PDF",
      onClick: () => switchPage(7),
    },
    hasAdminPermission && {
      title: "Configurações",
      description: "Aqui você pode ajustar as configurações do sistema",
      onClick: () => switchPage(8),
    },
  ]
    .filter(Boolean)
    .filter((button) => button!.title.toLowerCase().includes(search.toLowerCase()));

  const Sair = () => {
    localStorage.removeItem("id_user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <Header />
      <main className="background-blue">
        <aside className="sidebar">
          <nav className="nav-lateral">
            <ul>
              <li data-page="1" onClick={() => navigate("/home_biblio?page=1")} className="pointer">
                <a className="active">Início</a>
              </li>
              {hasAdminPermission && (
                <>
                  <li data-page="2" onClick={() => navigate("/home_biblio?page=2")} className="pointer">
                    <a>Cadastrar Usuários</a>
                  </li>
                  <li data-page="3" onClick={() => navigate("/home_biblio?page=3")} className="pointer">
                    <a>Gerenciar Usuários</a>
                  </li>
                </>
              )}
              <li data-page="4" onClick={() => navigate("/home_biblio?page=4")} className="pointer">
                <a>Cadastrar Livros</a>
              </li>
              <li data-page="5" onClick={() => navigate("/home_biblio?page=5")} className="pointer">
                <a>Gerenciar Livros</a>
              </li>
              <li data-page="6" onClick={() => navigate("/home_biblio?page=6")} className="pointer">
                <a>Movimentações</a>
              </li>
              <li data-page="7" onClick={() => navigate("/home_biblio?page=7")} className="pointer">
                <a>Relatórios</a>
              </li>
              {hasAdminPermission && (
                <li data-page="8" onClick={() => navigate("/home_biblio?page=8")} className="pointer">
                  <a>Configurações</a>
                </li>
              )}
              <div className="space-sm-y"></div>
              <li className="highlight pointer" onClick={Sair}>
                <a>Sair</a>
              </li>
            </ul>
          </nav>
        </aside>

        <section className="content montserrat-alternates-semibold">
          <div className="page active" data-page="1">
            <h1 className="size-titles">Funções de Admin, Quer fazer algo?..</h1>
            <form>
              <div className="p-relative">
                <input
                  required
                  type="text"
                  placeholder="Pesquisar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
            <div className="d-flex g-20 m-top-70 flex-wrap">
              {filteredButtons.map((button, index) => (
                <button
                  key={index}
                  className="botao-home-biblio"
                  onClick={button!.onClick}
                >
                  <span className="titulo-botao-home-biblio">{button!.title}</span>
                  <span className="descricao-botao-home-biblio">{button!.description}</span>
                </button>
              ))}
            </div>
          </div>

          {hasAdminPermission && (
            <>
              <div className="page" data-page="2"><CadastroUsuario /></div>
              <div className="page" data-page="3"><MostrarUsuarios /></div>
            </>
          )}
          <div className="page" data-page="4"><AddBooks /></div>
          <div className="page" data-page="5"><Livros /></div>
          <div className="page" data-page="6"><Movimentacoes /></div>
          <div className="page" data-page="7"><Relatorios /></div>
          {hasAdminPermission && (
            <div className="page" data-page="8"><Configuracoes /></div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomeBiblio;
