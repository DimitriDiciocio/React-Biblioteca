import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/Header";
import MostrarLivros from "../components/MostrarLivros";
import { usePermission } from "../components/usePermission";
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
}

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [disponivelReserva, setDisponivelReserva] = useState(false);
  const [disponivelEmprestimo, setDisponivelEmprestimo] = useState(false);
  const [mensagemIndisponivel, setMensagemIndisponivel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | null>(null);
  const navigate = useNavigate();
  const isAllowed = usePermission(1);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/livros/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Livro não encontrado");

        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id, token]);

  useEffect(() => {
    const verificarDisponibilidade = async () => {
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
    verificarDisponibilidade();
  }, [id, token]);

  if (loading) return <p>Carregando...</p>;
  if (!book) return <p>Livro não encontrado.</p>;

  const handleAgendamento = async () => {
    Swal.fire({
      title: "Quer Reservar?",
      text: `Você quer adicionar ${book.titulo} ao carrinho de reservas?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4562D6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Adicionar",
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
              body: JSON.stringify({ id_livro: book.id }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            Swal.fire(
              "Erro",
              errorData.message || "Erro ao adicionar ao carrinho",
              "error"
            );
            return;
          }

          Swal.fire({
            title: "Livro adicionado ao carrinho de reservas!",
            text: "Deseja ir para o carrinho ou continuar procurando mais livros?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Ir para o carrinho",
            cancelButtonText: "Procurar mais livros",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/user?page=4");
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

  const handleEmprestimo = async () => {
    Swal.fire({
      title: "Fazer Empréstimo?",
      text: `Você quer adicionar ${book.titulo} ao carrinho de empréstimos?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4562D6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Adicionar",
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
              body: JSON.stringify({ id_livro: book.id }),
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
            title: "Livro adicionado ao carrinho de empréstimos!",
            text: "Deseja ir para o carrinho ou continuar procurando mais livros?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Ir para o carrinho",
            cancelButtonText: "Procurar mais livros",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/user?page=4");
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

  const handleRating = async (rating: number) => {
    const newRating = userRating === rating ? 0 : rating;
    setUserRating(newRating);

    if (newRating === null || newRating === undefined) {
      Swal.fire("Erro", "Avaliação inválida.", "error");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/avaliarlivro/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ valor: newRating }),
      });
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    }
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="pagina-livro-informa">
      <Header />
      <main className="background-blue">
        <section className="d-flex center-x size-medium g-30">
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
              <div className="d-flex">
                {book.selectedTags.map((tag) => (
                  <p
                    key={tag.id}
                    className="tag montserrat-alternates-semibold m-right"
                  >
                    {tag.nome}
                  </p>
                ))}
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
                        onChange={() => handleRating(star)}
                      />
                      <label htmlFor={`star-${star}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={
                            userRating && userRating >= star
                              ? "#FFD700"
                              : "#ccc"
                          }
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
                  <p className="montserrat-alternates-semibold">{book.avaliacao}</p>
                </div>
              </div>
            </div>
            <div className="d-flex s-between">
              <p className="montserrat-alternates-semibold"><strong>Autor: </strong>{book.autor}</p>
              </div>
              <div>
              <p className="montserrat-alternates-semibold">
              <strong>Ano Publicado: </strong> {book.ano_publicado}
              </p>
              </div>
              <div>
              <p className="montserrat-alternates-semibold"><strong>ISBN: </strong> {book.isbn}</p>
            </div>
            <div className="d-flex s-between">
              <p className="montserrat-alternates-semibold"><strong>Idioma: </strong> {book.idiomas}</p>
              </div>
              <div>
              <p className="montserrat-alternates-semibold"><strong>Categoria: </strong> {book.categoria}</p>
            </div>
            <div>
              <p className="montserrat-alternates-semibold">
              <strong>Estoque: </strong> {book.qtd_disponivel}
              </p>
            </div>
            <div>
              <p className="montserrat-alternates-semibold m-top width-desc">
                {book.descricao}
              </p>
            </div>
            <div className="d-flex g-sm m-top">
              {disponivelEmprestimo && (
                <button className="learn-more" onClick={handleEmprestimo}>
                  <span className="circle" aria-hidden="true">
                    <span className="icon arrow"></span>
                  </span>
                  <span className="button-text montserrat-alternates-semibold">
                    Emprestar
                  </span>
                </button>
              )}
              {disponivelReserva && (
                <button className="learn-more" onClick={handleAgendamento}>
                  <span className="circle purple" aria-hidden="true">
                    <span className="icon arrow"></span>
                  </span>
                  <span className="button-text montserrat-alternates-semibold">
                    Reservar
                  </span>
                </button>
              )}
              {!disponivelEmprestimo && !disponivelReserva && mensagemIndisponivel && (
                <div
                  style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    border: "1px solid #f5c6cb",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    marginTop: "1rem",
                    fontWeight: "bold",
                    maxWidth: "400px"
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
        </section>
        <div className="oval"></div>
      </main>
      <Footer/>
    </div>
  );
};

export default BookDetail;
