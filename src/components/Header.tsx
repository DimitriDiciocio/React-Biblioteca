import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Swal from "sweetalert2";
import NotificacoesModal from "./NotificacoesModal";


const Header: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
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

  const toggleModal = () => {
    setModalOpen(!modalOpen);
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
              <div className="space-sm"></div>
              <button className="button" onClick={() => setNotificacoesOpen(!notificacoesOpen)}>
                <svg viewBox="0 0 448 512" className="bell">
                  <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
                </svg>
              </button>
              <div className="space-sm"></div>
              {token && localStorage.getItem("id_user") ? (
                <img
                  ref={userButtonRef}
                  src={imagemPreview || "../assets/img/user.png"}
                  alt="Usuário"
                  onClick={toggleModal}
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

      {modalOpen && (
        <Modal onClose={toggleModal} size="small">
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
          <button className="gerenciar">
              <p className="montserrat-alternates size-medium" onClick={() => navigate("/user")}>Gerenciar conta</p>
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
        <Modal onClose={() => setNotificacoesOpen(false)} size="large">
          <NotificacoesModal />
        </Modal>
      )}
    </div>
  );
};

export default Header;
