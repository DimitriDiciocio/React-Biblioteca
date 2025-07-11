import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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
  qtd_disponivel: number;
  descricao: string;
  idiomas: string;
  ano_publicacao: string;
  selectedTags: Tag[];
  imagem: string;
}

const MinhaLista: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [visivel, setVisivel] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch("http://127.0.0.1:5000/livros/minhalista", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setVisivel(false);
          }
          throw new Error("Erro ao buscar livros");
        }

        const data = await response.json();
        
        // Se recebermos { visivel: false }, não mostramos nada
        if ('visivel' in data && !data.visivel) {
          setVisivel(false);
          return;
        }

        setBooks(data);
      } catch (error) {
        console.error("Erro ao carregar livros:", error);
        setVisivel(false);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const handleRemoveFromList = async (bookId: number, bookTitle: string) => {
    Swal.fire({
      customClass: {
        title: 'montserrat-alternates-semibold',
        htmlContainer: 'montserrat-alternates',
        popup: 'montserrat-alternates',
        container: 'montserrat-alternates',
        confirmButton: 'montserrat-alternates',
        cancelButton: 'montserrat-alternates',
      },
      title: "Remover da Lista",
      text: `Deseja remover "${bookTitle}" da sua lista?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4562D6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Remover",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://127.0.0.1:5000/livros/minhalista/excluir/${bookId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.ok) {
            setBooks(books.filter(book => book.id !== bookId));
            Swal.fire({
              customClass: {
                title: 'montserrat-alternates-semibold',
                htmlContainer: 'montserrat-alternates',
                popup: 'montserrat-alternates',
                container: 'montserrat-alternates',
                confirmButton: 'montserrat-alternates',
              },
              title: "Removido!",
              text: `"${bookTitle}" foi removido da sua lista.`,
              icon: "success",
              confirmButtonText: "OK"
            });
          } else {
            throw new Error("Erro ao remover livro da lista");
          }
        } catch (error) {
          console.error("Erro ao remover livro:", error);
          Swal.fire({
            customClass: {
              title: 'montserrat-alternates-semibold',
              htmlContainer: 'montserrat-alternates',
              popup: 'montserrat-alternates',
              container: 'montserrat-alternates',
              confirmButton: 'montserrat-alternates',
            },
            title: "Erro",
            text: "Erro ao remover livro da lista.",
            icon: "error",
            confirmButtonText: "OK"
          });
        }
      }
    });
  };

  if (!visivel) {
    return null;
  }

  return (
    <section>
      <h1 className="p-4 font-bold montserrat-alternates-semibold">
        Minha Lista de Leitura
      </h1>
      {loading ? (
        <p className="montserrat-alternates">Carregando livros...</p>
      ) : books.length > 0 ? (
        <div className={`livros-grid ${
          books.length === 1
            ? "single-book"
            : books.length === 2
            ? "two-books"
            : books.length === 3
            ? "three-books"
            : ""
        }`}>
          {books.map((book) => (
            <div key={book.id} className="livro-card">
              <div 
                className="pointer" 
                onClick={() => navigate(`/livro/${book.id}`)}
              >
                <img
                  src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
                  alt={book.titulo}
                  className="livro-imagem"
                />
                <div className="livro-info">
                  <h3 className="montserrat-alternates">{book.titulo}</h3>
                  <p className="montserrat-alternates"><strong>Autor:</strong> {book.autor}</p>
                  <p className="montserrat-alternates"><strong>Categoria:</strong> {book.categoria}</p>
                  <p className="montserrat-alternates"><strong>ISBN:</strong> {book.isbn}</p>
                  {book.selectedTags && book.selectedTags.length > 0 && (
                    <div className="tags-container">
                      {book.selectedTags.map((tag) => (
                        <span key={tag.id} className="tag">
                          {tag.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button 
                className="remove-button montserrat-alternates"
                onClick={() => handleRemoveFromList(book.id, book.titulo)}
              >
                Remover da Lista
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="montserrat-alternates m-l-50">Nenhum livro na sua lista.</p>
      )}
    </section>
  );
};

export default MinhaLista;