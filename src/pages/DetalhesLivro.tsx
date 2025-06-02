import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/Header";
import MostrarLivros from "../components/MostrarLivros";
import Footer from "../components/Footer";
interface Tag {
  id: number;
  nome: string;
}

interface Book {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string;
  qtd_disponivel: string;
  descricao: string;
  selectedTags: Tag[];
  ano_publicado: string;
  imagem: string;
  avaliacao: number;
  idiomas: string;
  qtd_avaliacoes: number;
}

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [disponivelReserva, setDisponivelReserva] = useState(false);
  const [disponivelEmprestimo, setDisponivelEmprestimo] = useState(false);
  const [mensagemIndisponivel, setMensagemIndisponivel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [isInList, setIsInList] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function checkPermission() {
      if (!token) {
        setIsAllowed(false);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000/tem_permissao/1`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch {
        setIsAllowed(false);
      }
    }

    checkPermission();
  }, [token]);

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/livros/${id}`, {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Livro não encontrado");

        setBook(await response.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id, token]);

  const verificarDisponibilidade = async () => {
    if (!token || !isAllowed) return;

    try {
      const responseEmprestimo = await fetch(
        `http://127.0.0.1:5000/verificar_emprestimo/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const dataEmprestimo = await responseEmprestimo.json();
      setDisponivelEmprestimo(dataEmprestimo.disponivel);

      const responseReserva = await fetch(
        `http://127.0.0.1:5000/verificar_reserva/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const dataReserva = await responseReserva.json();
      setDisponivelReserva(dataReserva.disponivel);

      if (!dataReserva.disponivel && dataReserva.mensagem) {
        setMensagemIndisponivel(dataReserva.mensagem);
      }
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
    }
  };

  useEffect(() => {
    if (token && isAllowed) {
      verificarDisponibilidade();
    }
  }, [id, token, isAllowed, verificarDisponibilidade]);

  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/livros/${id}/avaliacao`,
          {
            method: "GET",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setUserRating((await response.json()).valor_total); // Set the user's rating
        } else {
          console.log("Usuário ainda não avaliou este livro.");
        }
      } catch (error) {
        console.error("Erro ao buscar avaliação do usuário:", error);
      }
    };

    fetchUserRating();
  }, [id, token]);

  useEffect(() => {
    const checkIfInList = async () => {
      if (!token || !isAllowed || !id) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/livros/minhalista/${id}/verificar`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { inList } = await response.json();
        setIsInList(inList);
      } catch (error) {
        console.error("Erro ao verificar lista:", error);
      }
    };

    checkIfInList();
  }, [token, isAllowed, id]);

  const handleAddToList = async () => {
    if (!token || !isAllowed || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/livros/minhalista/${isInList ? 'excluir' : 'adicionar'}/${id}`,
        {
          method: isInList ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsInList(!isInList); // Toggle the state
      }
    } catch (error) {
      console.error(`Erro ao ${isInList ? 'remover da' : 'adicionar à'} lista:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAgendamento = async () => {
    if (!token) {
      Swal.fire("Erro", "Você precisa estar logado para reservar.", "error");
      return;
    }

    if (!isAllowed) {
      Swal.fire({
        customClass: {
          title: 'montserrat-alternates-semibold',
          htmlContainer: 'montserrat-alternates-semibold',
          popup: 'montserrat-alternates-semibold',
          container: 'montserrat-alternates-semibold',
          confirmButton: 'montserrat-alternates-semibold',
        },
        title: "Erro",
        text: "Você não tem permissão para realizar esta ação.",
        icon: "error"
      });
      return;
    }

    Swal.fire({
      customClass: {
        title: 'montserrat-alternates-semibold',
        htmlContainer: 'montserrat-alternates-semibold',
        popup: 'montserrat-alternates-semibold',
        container: 'montserrat-alternates-semibold',
        confirmButton: 'montserrat-alternates-semibold',
        cancelButton: 'montserrat-alternates-semibold',
      },
      title: "Quer Reservar?",
      text: `Você quer adicionar ${book?.titulo} ao carrinho de reservas?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4562D6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Adicionar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            "http://127.0.0.1:5000/carrinho_reservas",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id_livro: book?.id }),
            }
          );

            if (!response.ok) {
            const errorData = await response.json();
            Swal.fire({
              customClass: {
              title: 'montserrat-alternates-semibold',
              htmlContainer: 'montserrat-alternates-semibold',
              confiemButton: 'montserrat-alternates-semibold',
              },
              title: "Erro",
              text: errorData.message || "Erro ao adicionar ao carrinho",
              icon: "error"
            });
            return;
          }

          Swal.fire({
            customClass: {
              title: 'montserrat-alternates-semibold',
              htmlContainer: 'montserrat-alternates-semibold',
              popup: 'montserrat-alternates-semibold',
              container: 'montserrat-alternates-semibold',
              confirmButton: 'montserrat-alternates-semibold',
              cancelButton: 'montserrat-alternates-semibold',
            },
            title: "Livro adicionado ao carrinho de reservas!",
            text: "Deseja ir para o carrinho ou continuar procurando mais livros?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Ir para o carrinho",
            cancelButtonText: "Procurar mais livros",
          }).then((result) => {
            if (result.isConfirmed) {
              const event = new CustomEvent("abrirCarrinhoLateral");
              window.dispatchEvent(event);
            }
          });
        } catch (error) {
          console.error("Erro ao realizar reserva:", error);
          Swal.fire(
            "Erro",
            "Ocorreu um erro ao tentar reservar o livro." + String(error),
            "error"
          );
        }
      }
    });
  };

  const handleEmprestimo = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!isAllowed) {
      Swal.fire("Erro", "Você não tem permissão para realizar esta ação.", "error");
      return;
    }

    Swal.fire({
      customClass: {
        title: 'montserrat-alternates-semibold',
        htmlContainer: 'montserrat-alternates-semibold',
        popup: 'montserrat-alternates-semibold',
        container: 'montserrat-alternates-semibold',
        confirmButton: 'montserrat-alternates-semibold',
        cancelButton: 'montserrat-alternates-semibold',
        content: 'montserrat-alternates-semibold',
      },
      
      title: "Fazer Empréstimo?",
      text: `Você quer adicionar ${book?.titulo} ao carrinho de empréstimos?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4562D6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Adicionar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            "http://127.0.0.1:5000/carrinho_emprestimos",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id_livro: book?.id }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            Swal.fire(
              "Erro",
              errorData.message || "Erro ao realizar o empréstimo",
              "error"
            );
            return;
          }

          Swal.fire({
            customClass: {
              title: 'montserrat-alternates-semibold',
              htmlContainer: 'montserrat-alternates-semibold',
              popup: 'montserrat-alternates-semibold',
              container: 'montserrat-alternates-semibold',
              cancelButton: 'montserrat-alternates-semibold',
              confirmButton: 'montserrat-alternates-semibold',
            },
            title: "Livro adicionado ao carrinho de empréstimos!",
            text: "Deseja ir para o carrinho ou continuar procurando mais livros?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Ir para o carrinho",
            cancelButtonText: "Procurar mais livros",
          }).then((result) => {
            if (result.isConfirmed) {
              const event = new CustomEvent("abrirCarrinhoLateral");
              window.dispatchEvent(event);
            }
          });
        } catch (error) {
          console.error("Erro ao realizar empréstimo:", error);
          Swal.fire(
            "Erro",
            "Ocorreu um erro ao tentar emprestar o livro." + String(error),
            "error"
          );
        }
      }
    });
  };

  const levarLogin = () => {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login")
  }
  if (localStorage.getItem("redirectAfterLogin") && isAllowed) {
    localStorage.removeItem("redirectAfterLogin");
  }

  // Update the rating logic to depend on the `checked` state in CSS
  const handleRating = async (rating: number | null) => {
    const ratingInput = rating !== null ? document.getElementById(`star-${rating}`) as HTMLInputElement : null;
    if (ratingInput && !ratingInput.checked) {
        return; // Do nothing if the star is not checked
    }

    if (!token) {
        navigate("/login");
        return;
    }

    if (!isAllowed) {
      Swal.fire("Erro", "Você não tem permissão para realizar esta ação.", "error");
      return;
    }

    const newRating = rating === null ? null : userRating === rating ? null : rating; // Toggle rating
    setUserRating(newRating);

    try {
        if (newRating === null) {
            // DELETE rating
            const response = await fetch(`http://127.0.0.1:5000/avaliarlivro/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire("Erro", errorData.error || "Erro ao deletar avaliação", "error");
                return;
            }

            setBook((prevBook) => {
                if (!prevBook) return prevBook;
                const novaQtdAvaliacoes = prevBook.qtd_avaliacoes - 1;
                const novaMedia = novaQtdAvaliacoes > 0
                    ? (prevBook.avaliacao * prevBook.qtd_avaliacoes - (rating || 0)) / novaQtdAvaliacoes
                    : 0;
                return {
                    ...prevBook,
                    qtd_avaliacoes: novaQtdAvaliacoes,
                    avaliacao: novaMedia,
                };
            });
        } else {
            // POST or update rating
            const response = await fetch(`http://127.0.0.1:5000/avaliarlivro/${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ valor: newRating }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire("Erro", errorData.message || "Erro ao enviar avaliação", "error");
                return;
            }

            setBook((prevBook) => {
                if (!prevBook) return prevBook;
                const novaQtdAvaliacoes = prevBook.qtd_avaliacoes + (userRating ? 0 : 1);
                const novaMedia =
                    (prevBook.avaliacao * prevBook.qtd_avaliacoes + newRating - (userRating || 0)) / novaQtdAvaliacoes;
                return {
                    ...prevBook,
                    qtd_avaliacoes: novaQtdAvaliacoes,
                    avaliacao: novaMedia,
                };
            });
        }
    } catch (error) {
      console.error("Erro ao enviar ou deletar avaliação:", error);
      Swal.fire("Erro", "Ocorreu um erro ao tentar enviar ou deletar a avaliação.", "error");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!book) return <p>Livro não encontrado.</p>;

  return (
    <div className="pagina-livro-informa">
      <Header />
      <main className="background-blue">
        <section className="d-flex center-x size-medium g-30 padding-bigbig">
          <div className="border-book3">
            <img
              src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
              alt={book.titulo}
            />
          </div>
          <div className="d-flex-column">
            <div className="d-flex s-between center-y m-top">
              <p className="montserrat-alternates-semibold big-size">
                {book.titulo}
              </p>
            </div>
            <div>
              <div className="d-flex g-sm center-x-responsive f-wrap">
                {book.selectedTags.map((tag) => (
                  <p
                    key={tag.id}
                    className="tag montserrat-alternates-semibold"
                  >
                    {tag.nome}
                  </p>
                ))}
                <span 
                  aria-hidden="true" 
                  className={isProcessing ? 'disabled' : ''} 
                  onClick={handleAddToList}
                  style={{ pointerEvents: isProcessing ? 'none' : 'auto' }}
                >
                  <label className="ui-bookmark">
                    <input type="checkbox" checked={isInList} readOnly/>
                    <div className="bookmark">
                      <svg viewBox="0 0 32 32">
                        <g>
                          <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"></path>
                        </g>
                      </svg>
                    </div>
                  </label>
                </span>
              </div>
            </div>
            <div>
              <div className="d-flex center-y">
                <div className="rating">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <React.Fragment key={star}>
                      <input
                        type="radio"
                        id={`star-${star}`}
                        name="star-radio"
                        value={star}
                        checked={userRating === star}
                        onChange={() => {
                          if (userRating === star) {
                            handleRating(null);
                          } else {
                            handleRating(star);
                          }
                        }}
                      />
                      <label htmlFor={`star-${star}`} className="star-label">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={userRating && userRating >= star ? "#FFD700" : "#ccc"}
                        >
                          <path
                            pathLength="360"
                            d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                          ></path>
                        </svg>
                      </label>
                    </React.Fragment>
                  ))}
                </div>

                <div>
                  <p className="montserrat-alternates-semibold">
                    {book.avaliacao}
                  </p>
                </div>
                <div className="montserrat-alternates-semibold m-l-10">
                  <p>({book.qtd_avaliacoes})</p>
                </div>
              </div>
            </div>
            <div className="d-flex s-between">
              <p className="montserrat-alternates-semibold">
                <strong>Autor: </strong>
                {book.autor}
              </p>
            </div>
            <div>
              <p className="montserrat-alternates-semibold">
                <strong>Ano Publicado: </strong> {book.ano_publicado}
              </p>
            </div>
            <div>
              <p className="montserrat-alternates-semibold">
                <strong>ISBN: </strong> {book.isbn}
              </p>
            </div>
            <div className="d-flex s-between">
              <p className="montserrat-alternates-semibold">
                <strong>Idioma: </strong> {book.idiomas}
              </p>
            </div>
            <div>
              <p className="montserrat-alternates-semibold">
                <strong>Categoria: </strong> {book.categoria}
              </p>
            </div>
            <div>
              <p className="montserrat-alternates-semibold">
                <strong>Estoque Disponível: </strong> {book.qtd_disponivel}
              </p>
            </div>
            <div className="d-flex center-x-responsive">
              <p className="montserrat-alternates-semibold m-top-5 width-desc">
                {book.descricao}
              </p>
            </div>
            <div className="d-flex g-sm m-top">
              {disponivelEmprestimo && token && (
                <button className="learn-more montserrat-alternates-semibold" onClick={handleEmprestimo}>
                  <span className="circle montserrat-alternates-semibold" aria-hidden="true">
                    <span className="icon arrow montserrat-alternates-semibold"></span>
                  </span>
                  <span className="button-text montserrat-alternates-semibold">
                    Emprestar
                  </span>
                </button>
              )}
              {!token && (
                <button className="learn-more montserrat-alternates-semibold" onClick={() => levarLogin()}> 
                  <span className="circle montserrat-alternates-semibold" aria-hidden="true">
                    <span className="icon arrow montserrat-alternates-semibold"></span>
                  </span>
                  <span className="button-text montserrat-alternates-semibold">
                    Emprestar
                  </span>
                </button>
              )}
              {disponivelReserva && (
                <button className="learn-more montserrat-alternates-semibold" onClick={handleAgendamento}>
                  <span className="circle purple montserrat-alternates-semibold" aria-hidden="true">
                    <span className="icon arrow montserrat-alternates-semibold"></span>
                  </span>
                  <span className="button-text montserrat-alternates-semibold">
                    Reservar
                  </span>
                </button>
              )}
              {!disponivelEmprestimo &&
                !disponivelReserva &&
                mensagemIndisponivel && (
                  <div
                    className="montserrat-alternates-semibold"
                    style={{
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      border: "1px solid #f5c6cb",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      marginTop: "1rem",
                      fontWeight: "bold",
                      maxWidth: "400px",
                    }}
                  >
                    {mensagemIndisponivel}
                  </div>
                )}
            </div>
          </div>
        </section>
        <div className="space-med-y"></div>
        <section>
          <p className="montserrat-alternates-semibold size-titles">
            Recomendados
          </p>
          <MostrarLivros />
          <div className="space-med-y"></div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BookDetail;
