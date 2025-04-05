import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Swal from "sweetalert2";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const userButtonRef = useRef<HTMLImageElement>(null);
  const [nome, setNome] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const token = localStorage.getItem("token");

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
          } else {
            Swal.fire({
              title: "Erro ao buscar dados do usuário",
              text: data.message,
              icon: "error",
            });
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

  return (
    <div>
      <header>
        <div className="d-flex s-between center-y header">
          <img
            src="../assets/img/LIBRIS.png"
            alt="LIBRIS"
            className="logo"
            onClick={() => navigate("/")}
          />
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
          <div>
            <nav className="d-flex">
              <button className="button">
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
                />
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
        <div className="divisor-line"></div>
      </header>
      <div className="fake-header"></div>

      {modalOpen && (
        <Modal onClose={toggleModal} size="small">
          <div className="modal-body">
            <img src={imagemPreview || undefined} alt="Usuário" className="user-button"/>
            <p>{nome}</p>
          </div>
          <div className="modal-footer">
            <button className="btn-primary" onClick={() => navigate("/user")}>
              Gerenciar Conta
            </button>
            <button className="btn-secondary" onClick={() => navigate("/sair")}>
              Trocar de Conta
            </button>
            <button className="btn-secondary" onClick={() => navigate("/sair")}>
              Sair
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Header;
