import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { usePermission } from "../components/usePermission";
import { useState } from "react";
import MostrarUsuarios from "./MostrarUsuários";
import Livros from "./Livros";
import Movimentacoes from "./Movimentacoes";
import Configuracoes from "./Configuracoes";
import AddBooks from "./AddBooks";
import CadastroUsuario from "./CadastroUsuario";
import Relatorios from "./Relatorios";
import { useEffect } from "react";

const HomeBiblio: React.FC = () => {
  const navigate = useNavigate();
  const isAllowed = usePermission(2);
  const [search, setSearch] = useState("");
  const queryParams = new URLSearchParams(window.location.search);
  const page = queryParams.get("page")?.split(",");

  useEffect(() => {
    switchPage(Number(page));
  }, [page]);

  const switchPage = (page: number) => {
    document.querySelectorAll(".nav-lateral li a").forEach((li, index) => {
      li.classList.toggle("active", index === page - 1);
    });
    document.querySelectorAll(".page").forEach((pageElement, index) => {
      pageElement.classList.toggle("active", index === page - 1);
    });
  };

  const filteredButtons = [
    {
      title: "Cadastrar Usuário",
      description: "Aqui você pode cadastrar um novo usuário",
      onClick: () => switchPage(2),
    },
    {
      title: "Gerenciar Usuários",
      description:
        "Aqui você pode ver a lista de usuários e editar suas informações",
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
    {
      title: "Configurações",
      description: "Aqui você pode ajustar as configurações do sistema",
      onClick: () => switchPage(8),
    },
  ].filter((button) =>
    button.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <Header />
      <main className="background-blue">
        <aside className="sidebar">
          <nav className="nav-lateral">
            <ul>
              <li onClick={() => switchPage(1)}>
                <a className="active">Início</a>
              </li>
              <li onClick={() => switchPage(2)}>
                <a>Cadastrar Usuários</a>
              </li>
              <li onClick={() => switchPage(3)}>
                <a>Gerenciar Usuários</a>
              </li>
              <li onClick={() => switchPage(4)}>
                <a>Cadastrar Livros</a>
              </li>
              <li onClick={() => switchPage(5)}>
                <a>Gerenciar Livros</a>
              </li>
              <li onClick={() => switchPage(6)}>
                <a>Movimentações</a>
              </li>
              <li onClick={() => switchPage(7)}>
                <a>Relatórios</a>
              </li>
              <li onClick={() => switchPage(8)}>
                <a>Configurações</a>
              </li>
              <div className="space-xxbig-y"></div>
              <li className="highlight" onClick={() => navigate("/sair")}>
                <a>Sair</a>
              </li>
            </ul>
          </nav>
        </aside>
        <section className="content montserrat-alternates-semibold">
          <div className="page active">
            <h1 className="size-titles">
              Funções de Admin, Quer fazer algo?..
            </h1>
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
            <div className="d-flex g-20 m-top-70">
              {filteredButtons.map((button, index) => (
                <button
                  key={index}
                  className="botao-home-biblio"
                  onClick={button.onClick}
                >
                  <span className="titulo-botao-home-biblio">
                    {button.title}
                  </span>
                  <span className="descricao-botao-home-biblio">
                    {button.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="page">
            <CadastroUsuario />
          </div>
          <div className="page">
            <MostrarUsuarios />
          </div>
          <div className="page">
            <AddBooks />
          </div>
          <div className="page">
            <Livros />
          </div>
          <div className="page">
            <Movimentacoes />
          </div>
          <div className="page">
            <Relatorios />
          </div>
          <div className="page">
            <Configuracoes />
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomeBiblio;
