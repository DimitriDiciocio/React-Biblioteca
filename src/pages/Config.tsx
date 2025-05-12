import React, { useCallback, useState, useEffect } from "react";
import Header from "../components/Header";
import { useDropzone } from "react-dropzone";
import { useNavigate, useLocation } from "react-router-dom";
import { usePermission } from "../components/usePermission";
import EditarUsuario from "../components/EditarUsuarioCopy";
import TrocarSenha from "../components/TrocarSenha";
import Carrinho from "../components/Carrinho";
import PuxarHistorico from "../components/PuxarHistorico";
import Swal from "sweetalert2";
import MultasByUser from "../components/MultasByUser";
import NotificacoesPage from "../components/NotificacoesPage";
import infoIcon from "../../assets/img/info-icon.png";
import securityIcon from "../../assets/img/security-icon.png";
import bookIcon from "../../assets/img/book-icon.png";
import listIcon from "../../assets/img/list-icon.png";
import historicIcon from "../../assets/img/historic-icon.png";
import fineIcon from "../../assets/img/fine-icon.png";
import notificationIcon from "../../assets/img/notification-icon.png";
import MinhaLista from "../components/MinhaLista";

const Config: React.FC = () => {
  const [nome, setNome] = useState("");
  const [imagemPreview, setImagemPreview] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isAllowed = usePermission(1);
  const token = localStorage.getItem("token");
  const queryParams = new URLSearchParams(window.location.search);
  const page = queryParams.get("page")?.split(",");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const switchPage = (page: number) => {
    document.querySelectorAll(".nav-lateral li a").forEach((li, index) => {
      li.classList.toggle("active", index === page - 1);
    });
    document.querySelectorAll(".page").forEach((pageElement, index) => {
      pageElement.classList.toggle("active", index === page - 1);
    });
  };

  useEffect(() => {
    switchPage(Number(page));
  }, [page]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get("page") || "1", 10);
    if (!isNaN(page)) {
      switchPage(page);
    }
  }, [location.search]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImagemPreview(URL.createObjectURL(file));
    }
  }, []);

  useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setNome(data.nome);
          setImagemPreview(data.imagem);

          if (data.imagem) {
            const imagemUrl = `http://127.0.0.1:5000/uploads/usuarios/${data.imagem}`;

            fetch(imagemUrl)
              .then((imgResponse) => {
                if (imgResponse.ok) {
                  setImagemPreview(imagemUrl);
                }
              })
              .catch(() => {
                console.log("Imagem não encontrada");
              });
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        Swal.fire({
          title: "Erro de conexão com o servidor",
          text: String(error),
          icon: "error",
        });
      }
    };

    fetchUserData();
  }, [navigate, token]);

  const isValidImage = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  const Sair = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <Header />
      <main className="background-blue">
        <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <nav className="nav-lateral">
            <ul>
              <div className="jc-end m-right left-x">
                <button className="xiii" onClick={toggleSidebar}>
                  {isSidebarOpen ? "✕" : "☰"}
                </button>
              </div>
              {isSidebarOpen && (
                <nav className="nav-lateral">
                  <ul>
                    <li onClick={() => navigate("/user?page=1")} className="pointer">
                      <a className="link-flex">
                        <img
                          src={infoIcon}
                          alt="Ícone Informações Pessoais"
                          className="icon-config"
                        />
                        <span>Informações Pessoais</span>
                      </a>
                    </li>
                    <li onClick={() => navigate("/user?page=2")} className="pointer">
                      <a className="link-flex">
                        <img
                          src={securityIcon}
                          alt="Ícone Segurança"
                          className="icon-config"
                        />
                        <span>Segurança</span>
                      </a>
                    </li>
                    <li onClick={() => navigate("/user?page=3")} className="pointer">
                      <a className="link-flex">
                        <img
                          src={bookIcon}
                          alt="Ícone Gerenciar Livros"
                          className="icon-config"
                        />
                        <span>Gerenciar Livros</span>
                      </a>
                    </li>
                    <li onClick={() => navigate("/user?page=4")} className="pointer">
                      <a className="link-flex">
                        <img
                          src={listIcon}
                          alt="Ícone Minha Lista"
                          className="icon-config"
                        />
                        <span>Minha Lista</span>
                      </a>
                    </li>
                    <li onClick={() => navigate("/user?page=5")} className="pointer">
                      <a className="link-flex">
                        <img
                          src={historicIcon}
                          alt="Ícone Histórico"
                          className="icon-config"
                        />
                        <span>Histórico</span>
                      </a>
                    </li>
                    <li onClick={() => navigate("/user?page=6")} className="pointer">
                      <a className="link-flex">
                        <img
                          src={fineIcon}
                          alt="Ícone Minhas Multas"
                          className="icon-config"
                        />
                        <span>Minhas Multas</span>
                      </a>
                    </li>
                    <li onClick={() => navigate("/user?page=7")} className="pointer">
                      <a className="link-flex">
                        <img
                          src={notificationIcon}
                          alt="Ícone Notificações"
                          className="icon-config"
                        />
                        <span>Notificações</span>
                      </a>
                    </li>
                    <div className="space-sm-y"></div>
                  </ul>
                  <ul>
                    <li className="highlight pointer" onClick={Sair}>
                      <a>Sair</a>
                    </li>
                  </ul>
                </nav>
              )}
            </ul>
          </nav>
        </aside>

        <section className="content montserrat-alternates-semibold">
          <div className="page active">
            <EditarUsuario />
          </div>
          <div className="page">
            <TrocarSenha />
          </div>
          <div className="page">
            <Carrinho />
          </div>
          <div className="page">
            <MinhaLista/>
          </div>
          <div className="page">
            <PuxarHistorico />
          </div>
          <div className="page">
            <MultasByUser />
          </div>
          <div className="page">
            <NotificacoesPage />
          </div>
        </section>
      </main>
    </div>
  );
};
export default Config;
