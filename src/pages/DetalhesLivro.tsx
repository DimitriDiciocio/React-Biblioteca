import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DeletarLivro from "../DeletarLivro";
import Header from "../Header";

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
}

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleOpenBook = (book: Book) => {
    const url = `/editar_livro/${book.id}`;
    window.location.href = url;
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    const tokenIsActive = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          Swal.fire(
            "Erro",
            result.error || "Erro na verificação do token",
            "error"
          );
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        navigate("/login");
      }
    };

    tokenIsActive();
  }, [navigate, token]);

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/livros/${id}`);
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
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!book) return <p>Livro não encontrado.</p>;

  const handleAgendamento = async () => {
    Swal.fire({
      title: "Quer Agendar?",
      text: `Você quer adicionar ${book.titulo} ao carrinho de reservas?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4562D6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Agendar",
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
            title: `Sucesso!`,
            text: `${book.titulo} foi adicionado ao seu carrinho de reservas!`,
            icon: "success",
          });
        } catch (error) {
          console.error("Erro ao adicionar ao carrinho:", error);
          Swal.fire(
            "Erro",
            "Ocorreu um erro ao tentar adicionar ao carrinho" + String(error),
            "error"
          );
        }
      }
    });
  };

  const handleEmprestimo = () => {
    Swal.fire({
      title: "Fazer Empréstimo?",
      text: `Você quer fazer o empréstimo do livro ${book.titulo}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4562D6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Emprestar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Emprestado!",
          text: "A devolução ficará para o dia 00/00/0000!",
          icon: "success",
        });
      }
    });
  };

  return (
    <div className="pagina-livro-informa">
      <Header />

      <div className="espaco-vazio"></div>
      <div className="container-fluid">
        <div className="d-flex-eve row">
          <div className="col-6">
            <img
              src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
              style={{
                width: "50%",
                height: "100%",
                maxHeight: "100%",
                objectFit: "cover",
                right: "100px",
              }}
              className="livro"
            />
          </div>
        </div>
        <div className="row informacoes">
          <div className="col-6">
            <div className="d-flex estreita">
              <p className="titulo">{book.titulo}</p>
              <div className="d-flex avaliacao">
                <p>4.8</p>
                <i>star</i>
              </div>
            </div>
            <p className="autor">{book.autor}</p>
            <div className="d-flex tags">
              {book.selectedTags?.map((tag) => (
                <p key={tag.id} className="tag">
                  {tag.nome}
                </p>
              ))}
            </div>
            <p className="plot">{book.descricao}</p>
            <div className="d-flex-bit">
              <p className="ano">{book.ano_publicado}</p>
              <p className="codigo">{book.isbn}</p>
            </div>

            <div className="avalie d-flex">
              <i className="star">star</i>
              <i className="star">star</i>
              <i className="star">star</i>
              <i className="star">star</i>
              <i className="star">star</i>
            </div>

            <div className="botoes">
              <p
                id="agenda"
                onClick={handleAgendamento}
                className="agendamento botao-fundo-transparente"
              >
                Reservar
              </p>
              <p
                id="empresta"
                onClick={handleEmprestimo}
                className="emprestimo botao-fundo-azul"
              >
                Fazer Empréstimo
              </p>
              <DeletarLivro id_livro={book.id} />
              <p onClick={() => handleOpenBook(book)}>Editar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
