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
  const [sidebarRightOpen, setSidebarRightOpen] = useState(false);
  const [isSidebarClosing, setIsSidebarClosing] = useState(false);

  // Carrinho state
  const [reservas, setReservas] = useState<any[]>([]);
  const [emprestimos, setEmprestimos] = useState<any[]>([]);
  const [loadingCarrinho, setLoadingCarrinho] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [borrowing, setBorrowing] = useState(false);

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

  const toggleSidebarRight = () => setSidebarRightOpen((prev) => !prev);

  const closeSidebarRight = () => {
    setIsSidebarClosing(true);
    setTimeout(() => {
      setSidebarRightOpen(false);
      setIsSidebarClosing(false);
    }, 300);
  };

  const Sair = () => {
    localStorage.removeItem("id_user");
    localStorage.removeItem("token");
    navigate("/login")
  }

  // Carregar carrinho ao abrir sidebar direita
  useEffect(() => {
    if (!sidebarRightOpen) return;
    const token = localStorage.getItem("token");
    const fetchReservas = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/carrinho_reservas",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar reservas");
        const result = await response.json();
        setReservas(
          result.map((reserva: any) => ({
            id_reserva: reserva.id_reserva,
            id_usuario: reserva.id_usuario,
            id_livro: reserva.id_livro,
            data_adicionado: reserva.data_adicionado,
            imagem: reserva.imagem || "default.jpg",
            titulo: reserva.livro?.titulo || "Título Desconhecido",
            autor: reserva.livro?.autor || "Autor Desconhecido",
          }))
        );
      } catch {
        setReservas([]);
      }
    };
    const fetchEmprestimos = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/carrinho_emprestimos",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar empréstimos");
        const result = await response.json();
        setEmprestimos(
          result.map((emprestimo: any) => ({
            id_emprestimo: emprestimo.id_emprestimo,
            id_usuario: emprestimo.id_usuario,
            id_livro: emprestimo.id_livro,
            data_adicionado: emprestimo.data_adicionado,
            imagem: emprestimo.imagem || "default.jpg",
            titulo: emprestimo.livro?.titulo || "Título Desconhecido",
            autor: emprestimo.livro?.autor || "Autor Desconhecido",
          }))
        );
      } catch {
        setEmprestimos([]);
      }
    };
    setLoadingCarrinho(true);
    Promise.all([fetchReservas(), fetchEmprestimos()]).finally(() =>
      setLoadingCarrinho(false)
    );
  }, [sidebarRightOpen]);

  // Função para remover livro do carrinho
  const removerLivro = async (id: number, tipo: "reserva" | "emprestimo") => {
    const token = localStorage.getItem("token");
    const confirmacao = await Swal.fire({
      title: "Remover Livro?",
      text: "Tem certeza de que deseja remover este livro do carrinho?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacao.isConfirmed) return;
    try {
      const endpoint =
        tipo === "reserva"
          ? `http://127.0.0.1:5000/carrinho_reservas/${id}`
          : `http://127.0.0.1:5000/carrinho_emprestimos/${id}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao remover livro");
      if (tipo === "reserva") {
        setReservas((prev) => prev.filter((book) => book.id_reserva !== id));
      } else {
        setEmprestimos((prev) =>
          prev.filter((book) => book.id_emprestimo !== id)
        );
      }
      Swal.fire({
        icon: "success",
        title: "Removido!",
        text: "O livro foi removido do carrinho.",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível remover o livro.",
      });
    }
  };

  // Reservar todos
  const reservarLivros = async () => {
    const token = localStorage.getItem("token");
    if (reservas.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrinho vazio",
        text: "Adicione livros antes de reservar.",
      });
      return;
    }
    setReserving(true);
    try {
      const indisponiveis: any[] = [];
      const verificacoes = await Promise.all(
        reservas.map(async (book) => {
          const response = await fetch(
            `http://127.0.0.1:5000/verificar_reserva/${book.id_livro}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!response.ok) throw new Error("Erro ao verificar disponibilidade");
          const result = await response.json();
          if (!result.disponivel) indisponiveis.push(book);
          return result.disponivel;
        })
      );
      if (indisponiveis.length > 0) {
        const { isConfirmed } = await Swal.fire({
          title: "Alguns livros não estão disponíveis",
          html: `<p>Os seguintes livros não podem ser reservados:</p><ul>${indisponiveis
            .map((book) => `<li>${book.titulo}</li>`)
            .join("")}</ul><p>Deseja removê-los e continuar?</p>`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Remover indisponíveis e continuar",
          cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) {
          setReserving(false);
          return;
        }
        for (const book of indisponiveis) {
          await removerLivro(book.id_reserva, "reserva");
        }
      }
      const confirmacao = await Swal.fire({
        title: "Confirmar Reserva?",
        text: "Todos os itens do carrinho serão reservados.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Sim, reservar",
        cancelButtonText: "Cancelar",
      });
      if (!confirmacao.isConfirmed) {
        setReserving(false);
        return;
      }
      const response = await fetch("http://127.0.0.1:5000/reservar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setReservas([]);
        Swal.fire({
          icon: "success",
          title: "Reserva Confirmada!",
          text: "Os livros foram reservados com sucesso.",
        });
      } else {
        Swal.fire({ icon: "error", title: "Erro", text: String(data.message) });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Erro", text: String(error) });
    } finally {
      setReserving(false);
    }
  };

  // Emprestar todos
  const emprestarLivros = async () => {
    const token = localStorage.getItem("token");
    if (emprestimos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrinho vazio",
        text: "Adicione livros antes de reservar.",
      });
      return;
    }
    setBorrowing(true);
    const indisponiveis: any[] = [];
    for (const livro of emprestimos) {
      const response = await fetch(
        `http://127.0.0.1:5000/verificar_emprestimo/${livro.id_livro}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (!result.disponivel) {
        indisponiveis.push(livro);
      }
    }
    if (indisponiveis.length > 0) {
      const confirmacao = await Swal.fire({
        title: "Livros Indisponíveis",
        text: `Os seguintes livros não estão disponíveis para empréstimo:\n${indisponiveis
          .map((livro) => livro.titulo)
          .join(", ")}\nDeseja remover esses livros e continuar com a reserva?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover e continuar",
        cancelButtonText: "Cancelar",
      });
      if (confirmacao.isConfirmed) {
        for (const livro of indisponiveis) {
          await removerLivro(livro.id_emprestimo, "emprestimo");
        }
        try {
          await fetch("http://127.0.0.1:5000/emprestar", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          setEmprestimos([]);
          Swal.fire({
            icon: "success",
            title: "Empréstimo Confirmado!",
            text: "Os livros foram emprestados com sucesso.",
          });
        } catch {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Não foi possível emprestar os livros.",
          });
        }
      }
    } else {
      const confirmacao = await Swal.fire({
        title: "Confirmar Empréstimo?",
        text: "Todos os itens do carrinho serão emprestados.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Sim, emprestar",
        cancelButtonText: "Cancelar",
      });
      if (!confirmacao.isConfirmed) {
        setBorrowing(false);
        return;
      }
      try {
        const response = await fetch("http://127.0.0.1:5000/emprestar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          setEmprestimos([]);
          Swal.fire({
            icon: "success",
            title: "Empréstimo Confirmado!",
            text: "Os livros foram emprestados com sucesso.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: String(data.message),
          });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Erro", text: String(error) });
      }
    }
    setBorrowing(false);
  };

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
                className="montserrat-alternates-semibold"
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
                        d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"
                      ></path>
                    </svg>
                    <span className="tooltip">settings</span>
                  </button>
                </div>
              )}
              {token && (
                <>
                  <NotificationIcon onClick={toggleNotificacoesModal} />
                  <button className="button" onClick={toggleSidebarRight}>
                    <svg className="cart" fill="white" viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path></svg>
                  </button>
                  <div className="space-sm"></div>
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
                <button className="button-sign-in montserrat-alternates-semibold"
                onClick={() => navigate("/login")}
                >  
                    Entrar
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
              <div className="p-relative ">
                <input 
                  className="montserrat-alternates-semibold"
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

      {/* Sidebar direita (replicada da Config, mas na direita) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: sidebarRightOpen || isSidebarClosing ? 1999 : -1,
          background: sidebarRightOpen || isSidebarClosing ? "rgba(0,0,0,0.0)" : "transparent",
          pointerEvents: sidebarRightOpen || isSidebarClosing ? "auto" : "none",
          transition: "background 0.3s",
        }}
        onClick={closeSidebarRight}
      >
        {(sidebarRightOpen || isSidebarClosing) && (
          <aside
            className={`sidebar sidebar-right ${sidebarRightOpen ? (isSidebarClosing ? "closing" : "open") : ""}`}
            style={{
              position: "fixed",
              top: 100,
              right: sidebarRightOpen ? 0 : "-300px",
              left: "auto",
              height: "calc(100vh - 100px)",
              width: 300,
              background: "#fff",
              zIndex: 2000,
              boxShadow: "-2px 0 8px rgba(0,0,0,0.12)",
              borderRadius: "12px 0 0 12px",
              transition: "right 0.3s cubic-bezier(.77,0,.18,1)",
              display: "flex",
              flexDirection: "column",
              paddingTop: 0,
              animation: sidebarRightOpen
                ? (isSidebarClosing ? "slideOutRight 0.3s" : "slideInRight 0.3s")
                : "",
              pointerEvents: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0px 10px 0 0" }}>
              <button className="xiii" onClick={closeSidebarRight}>
                ✕
              </button>
            </div>
            <div style={{ padding: "0 18px", overflowY: "auto", flex: 1 }}>
              <h2 className="montserrat-alternates-semibold" style={{ fontSize: 20, margin: "10px 0" }}>Minha Cestinha</h2>
              {loadingCarrinho ? (
                <p className="montserrat-alternates">Carregando...</p>
              ) : (
                <>
                  <div>
                    <h3 className="montserrat-alternates-semibold" style={{ fontSize: 16 }}>Livros Reservados</h3>
                    {reservas.length === 0 ? (
                      <p className="montserrat-alternates">Nenhum livro reservado.</p>
                    ) : (
                      <div>
                        {reservas.map((book) => (
                          <div key={book.id_reserva} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                            <img
                              src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
                              alt={book.titulo}
                              style={{ width: 32, height: 48, objectFit: "cover", borderRadius: 4, marginRight: 8 }}
                            />
                            <div style={{ flex: 1 }}>
                              <div className="montserrat-alternates" style={{ fontSize: 14 }}>{book.titulo}</div>
                              <div className="montserrat-alternates" style={{ fontSize: 12 }}>{book.autor}</div>
                            </div>
                            <button
                              className="botao-remover montserrat-alternates-semibold"
                              style={{ fontSize: 18, background: "none", border: "none", color: "red", cursor: "pointer" }}
                              onClick={() => removerLivro(book.id_reserva, "reserva")}
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                        <div style={{ margin: "10px 0" }}>
                          <button
                            className="botao-acao montserrat-alternates-semibold"
                            style={{ width: "100%" }}
                            onClick={reservarLivros}
                            disabled={reserving}
                          >
                            Reservar Todos
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <h3 className="montserrat-alternates-semibold" style={{ fontSize: 16 }}>Livros Emprestados</h3>
                    {emprestimos.length === 0 ? (
                      <p className="montserrat-alternates">Nenhum livro emprestado.</p>
                    ) : (
                      <div>
                        {emprestimos.map((book) => (
                          <div key={book.id_emprestimo} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                            <img
                              src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
                              alt={book.titulo}
                              style={{ width: 32, height: 48, objectFit: "cover", borderRadius: 4, marginRight: 8 }}
                            />
                            <div style={{ flex: 1 }}>
                              <div className="montserrat-alternates" style={{ fontSize: 14 }}>{book.titulo}</div>
                              <div className="montserrat-alternates" style={{ fontSize: 12 }}>{book.autor}</div>
                            </div>
                            <button
                              className="botao-remover montserrat-alternates-semibold"
                              style={{ fontSize: 18, background: "none", border: "none", color: "red", cursor: "pointer" }}
                              onClick={() => removerLivro(book.id_emprestimo, "emprestimo")}
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                        <div style={{ margin: "10px 0" }}>
                          <button
                            className="botao-acao montserrat-alternates-semibold"
                            style={{ width: "100%" }}
                            onClick={emprestarLivros}
                            disabled={borrowing}
                          >
                            Emprestar Todos
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Header;
