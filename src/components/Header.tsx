import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Swal from "sweetalert2";
import NotificacoesModal from "./NotificacoesModal";
import { useStore } from "../store/useStore";
import NotificationIcon from "./NotificationIcon";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const {
    modalAberto,
    setModalAberto,
    fetchNotificacoes,
    marcarNotificacaoComoLida,
    notificacoes,
    temNotificacoesNovas,
    setTemNotificacoesNovas,
  } = useStore();
  const userButtonRef = useRef<HTMLImageElement>(null);
  const [nome, setNome] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const [hasBibliotecarioPermission, setHasBibliotecarioPermission] =
    useState(false);
  const [isPermissionChecked, setIsPermissionChecked] = useState(false);
  const [notificacoesOpen, setNotificacoesOpen] = useState(false);

  const handleFiltroClick = () => {
    navigate('/pesquisa/');
  };

  useEffect(() => {
    async function checkPermission() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/tem_permissao/2`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const responseData = await response.json();

        if (response.ok) {
          setHasBibliotecarioPermission(true);
        } else {
          if (responseData.verificacao === 4) {
            setHasBibliotecarioPermission(false);
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
        setHasBibliotecarioPermission(false);
      } finally {
        setIsPermissionChecked(true);
      }
    }

    checkPermission();
  }, [navigate, setHasBibliotecarioPermission]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
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
          }
        } catch (error) {
          Swal.fire({
            title: "Erro de conexão com o servidor",
            text: String(error),
            icon: "error",
          });
        }
      }
    };

    fetchUserData();
  }, [navigate, token]);

  useEffect(() => {
    fetchNotificacoes(); // Fetch notifications on component mount
  }, [fetchNotificacoes]);

  const handleAbrirModal = () => {
    setModalAberto(!modalAberto);
    setNotificacoesOpen(false); // Close notifications modal
    if (!modalAberto) {
      marcarNotificacaoComoLida("id"); // Replace "id" with the actual id value
    }
  };

  const toggleNotificacoesModal = () => {
    setNotificacoesOpen(!notificacoesOpen);
    setModalAberto(false); // Close account modal
    if (!notificacoesOpen) {
      setTemNotificacoesNovas(false);
    }
  };

  const Sair = () => {
    localStorage.removeItem("id_user");
    localStorage.removeItem("token");
    navigate("/login")
  }

  if (!isPermissionChecked) {
    return null;
  }

  return (
    <div>
      <header>
        <div className="d-flex s-between center-y header">
          <p
            className="delius-regular"
            onClick={() => navigate("/")}
            style={{cursor: "pointer"}}
          >Read Raccoon
          </p>
          <form className="input-laptop"
            onSubmit={(e) => {
              e.preventDefault();
              const query = (
                document.getElementById("campo-busca") as HTMLInputElement
              )?.value;
              const filters = Array.from(
                document.querySelectorAll(".filter-checkbox:checked")
              ).map((checkbox) => (checkbox as HTMLInputElement).value);
              navigate(`/pesquisa/${query}?filters=${filters.join(",")}`);
            }}
          >
            <div className="p-relative">
              <input
                id="campo-busca"
                type="text"
                placeholder="Pesquisar..."
              />
              <span id="avancada" onClick={handleFiltroClick}></span>
            </div>
          </form>
          <div>
            <nav className="d-flex">
              {hasBibliotecarioPermission && (
                <div onClick={() => navigate("/home_biblio?page=1")}>
                  <button className="button">
                    <svg
                      className="settings-btn"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 -960 960 960"
                      width="24"
                      fill="#e8eaed"
                    >
                      <path
                        d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 ```html
                99t99.5 41Zm-2-140Z"
                      ></path>
                    </svg>
                    <span className="tooltip">settings</span>
                  </button>
                </div>
              )}
              {token && (
                <>
                  <NotificationIcon onClick={toggleNotificacoesModal} />
                </>
              )}
              {token ? (
                <img
                  ref={userButtonRef}
                  src={imagemPreview || "../assets/img/user.png"}
                  alt="Usuário"
                  onClick={handleAbrirModal} // Ensure this calls the updated function
                  className="user-button"
                  style={{cursor: "pointer"}}
                />
              ) : (
                <button className="button-sign-in"
                onClick={() => navigate("/login")}
                >  
                    Sign in
                    <div className="arrow-wrapper">
                        <div className="arrow"></div>
                
                    </div>
                </button>
              )}
            </nav>
          </div>
        </div>
        <div className="d-flex s-between input-phone">
          <div></div>
          <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = (
                  document.getElementById("campo-busca") as HTMLInputElement
                )?.value;
                const filters = Array.from(
                  document.querySelectorAll(".filter-checkbox:checked")
                ).map((checkbox) => (checkbox as HTMLInputElement).value);
                navigate(`/pesquisa/${query}?filters=${filters.join(",")}`);
              }}
            >
              <div className="p-relative">
                <input
                  id="campo-busca"
                  required
                  type="text"
                  placeholder="Pesquisar..."
                />
                <span id="avancada"></span>
              </div>
          </form>
          <div></div>
        </div>
        <div className="space-sm-y header-phone"></div>
        <div className="divisor-line"></div>
      </header>
      <div className="fake-header"></div>

      {modalAberto && (
        <Modal onClose={handleAbrirModal} size="small">
          <div className="modal-body">
            <img
              src={imagemPreview || "../assets/img/user.png"}
              alt="Usuário"
              className="user-button2"
            />
            <p className="montserrat-alternates-semibold size-medium">{nome}</p>
          </div>
          <div className="space-ssm-y"></div>
          <div className="d-flex-column">
          <button className="gerenciar" onClick={() => navigate("/user?page=1")}>
              <p className="montserrat-alternates size-medium" >Gerenciar conta</p>
            </button>
            <button className="center-x center-y carrinho-btn" onClick={() => navigate("/user?page=3")}>
              <img className="cesta" src="../assets/img/cesta.png" alt="" />
              <p className="montserrat-alternates size-medium" >Cestinha</p>
          </button>
          <div className="d-flex center-x">

            <button className="Btn-modal" onClick={Sair}>
              <div className="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
              
              <div className="text-logout montserrat-alternates size-medium">Logout</div>
            </button>
            </div>
          </div>
        </Modal>
      )}

      {notificacoesOpen && (
          <NotificacoesModal onClose={() => setNotificacoesOpen(false)} />
      )}
    </div>
  );
};

export default Header;
