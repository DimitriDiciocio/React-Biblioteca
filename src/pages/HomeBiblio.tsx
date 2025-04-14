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
import Multas from "../components/Multas";

const HomeBiblio: React.FC = () => {
  const navigate = useNavigate();
  const isAllowed = usePermission(2);
  const [search, setSearch] = useState("");
  const [hasAdminPermission, setHasAdminPermission] = useState(false);
  const [isPermissionChecked, setIsPermissionChecked] = useState(false);
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const page = Number(new URLSearchParams(window.location.search).get("page")) || 1;

  // Verifica permissão de administrador
  useEffect(() => {
    async function checkPermission() {
      try {
        const response = await fetch("http://127.0.0.1:5000/tem_permissao/3", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await response.json();

        if (response.ok) {
          setHasAdminPermission(true);
        } else {
          if (data.verificacao === 4) {
            setHasAdminPermission(false);
          } else if ([1, 2, 3].includes(data.verificacao)) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            navigate("/login");
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

  // Aguarda permissão + DOM montado
  useEffect(() => {
    if (isPermissionChecked && isAllowed !== null) {
      // Garante que o DOM da sidebar e páginas esteja montado
      const timeout = setTimeout(() => {
        setIsReadyToRender(true);
      }, 50); // pequeno delay para garantir render completo

      return () => clearTimeout(timeout);
    }
  }, [isPermissionChecked, isAllowed]);

  // Quando estiver pronto, aplica a página correta
  useEffect(() => {
    if (isReadyToRender) {
      switchPage(page);
    }
  }, [isReadyToRender, page]);

  const switchPage = (page: number) => {
    document.querySelectorAll(".nav-lateral li a").forEach((a) => {
      a.classList.remove("active");
    });

    const activeNav = document.querySelector(`.nav-lateral li[data-page="${page}"] a`);
    if (activeNav) activeNav.classList.add("active");

    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));

    const activePage = document.querySelector(`.page[data-page="${page}"]`);
    if (activePage) activePage.classList.add("active");
  };

  const Sair = () => {
    localStorage.removeItem("id_user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filteredButtons = [
    hasAdminPermission && {
      title: "Cadastrar Usuário",
      description: "Aqui você pode cadastrar um novo usuário",
      onClick: () => navigate("/home_biblio?page=2"),
    },
    hasAdminPermission && {
      title: "Gerenciar Usuários",
      description: "Aqui você pode ver a lista de usuários e editar suas informações",
      onClick: () => navigate("/home_biblio?page=3"),
    },
    {
      title: "Cadastrar Livro",
      description: "Aqui você pode cadastrar um novo livro na Libris",
      onClick: () => navigate("/home_biblio?page=4"),
    },
    {
      title: "Gerenciar Livros",
      description: "Aqui você pode ver os livros e editar suas informações",
      onClick: () => navigate("/home_biblio?page=5"),
    },
    {
      title: "Movimentações",
      description: "Aqui você pode acompanhar as movimentações da biblioteca",
      onClick: () => navigate("/home_biblio?page=6"),
    },
    {
      title: "Multas",
      description: "Aqui você acompanhar as multas da biblioteca",
      onClick: () => navigate("/home_biblio?page=7"),
    },
    {
      title: "Relatórios",
      description: "Aqui você poderá gerar um relatório dos usuários e livros no formato PDF",
      onClick: () => navigate("/home_biblio?page=8"),
    },
    hasAdminPermission && {
      title: "Configurações",
      description: "Aqui você pode ajustar as configurações do sistema",
      onClick: () => navigate("/home_biblio?page=9"),
    },
  ]
    .filter(Boolean)
    .filter((button) => button!.title.toLowerCase().includes(search.toLowerCase()));

  if (!isPermissionChecked || isAllowed === null || !isReadyToRender) {
    return (
      <div className="d-flex center-x center-y" style={{height: "100vh"}}>
        <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster">
          <div className="wheel"></div>
          <div className="hamster">
            <div className="hamster__body">
              <div className="hamster__head">
                <div className="hamster__ear"></div>
                <div className="hamster__eye"></div>
                <div className="hamster__nose"></div>
              </div>
              <div className="hamster__limb hamster__limb--fr"></div>
              <div className="hamster__limb hamster__limb--fl"></div>
              <div className="hamster__limb hamster__limb--br"></div>
              <div className="hamster__limb hamster__limb--bl"></div>
              <div className="hamster__tail"></div>
            </div>
          </div>
          <div className="spoke"></div>
        </div>
      </div>
    );
  }

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
                <a>Multas</a>
              </li>
              <li data-page="8" onClick={() => navigate("/home_biblio?page=8")} className="pointer">
                <a>Relatórios</a>
              </li>
              {hasAdminPermission && (
                <li data-page="9" onClick={() => navigate("/home_biblio?page=9")} className="pointer">
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
          <div className="page" data-page="8"><Multas /></div>
          {hasAdminPermission && (
            <div className="page" data-page="9"><Configuracoes /></div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomeBiblio;
