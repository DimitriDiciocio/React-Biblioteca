import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  qtd_disponivel: string;
  descricao: string;
  selectedTags: Tag[];
  imagem: string;
}

const Search = () => {
  const { search } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const filtros = queryParams.get("filters")?.split(",") || [];
  const [books, setBooks] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Estado para armazenar erro
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleOpenBook = (book: Book) => {
    const url = `/livro/${book.id}`;
    window.location.href = url;
  };

  useEffect(() => {
    const verificarToken = async () => {
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

        if (!response.ok) {
          Swal.fire("Erro", "Sessão expirada. Faça login novamente.", "error");
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        navigate("/login");
      }
    };

    verificarToken();
  }, [navigate, token]);

  useEffect(() => {
    const searchBooks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/pesquisa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pesquisa: search,
            filtros: filtros,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "Erro desconhecido ao buscar livros.");
          return; // Retorna para evitar o processamento adicional
        }

        const data = await response.json();
        setBooks(data.resultados); // Definindo os livros obtidos
        setHasSearched(true); // Marcar que a busca foi realizada
        setErrorMessage(null); // Limpar mensagem de erro caso a busca tenha sucesso
      } catch (error) {
        const errorMessage =
          (error as Error).message || "Erro ao buscar livros";
        setErrorMessage(errorMessage); // Armazena a mensagem de erro
        console.log(errorMessage);
      }
    };

    if (!hasSearched) {
      searchBooks();
    }
  }, [search, filtros, token, hasSearched]);

  return (
    <div>
      <h1>Search Page</h1>
      {errorMessage && <p>{errorMessage}</p>} {/* Exibe mensagem de erro */}
      {books.length === 0 && hasSearched && !errorMessage ? (
        <p>Nenhum livro encontrado para sua pesquisa.</p>
      ) : (
        books.map((book, index) => {
          const imageUrl = `http://127.0.0.1:5000/uploads/livros/${book.imagem}`;
          return (
            <div
              key={index}
              className="livro col-12"
              onClick={() => handleOpenBook(book)}
              style={{ cursor: "pointer" }}
            >
              <img className="capa-livro" src={imageUrl} alt={book.titulo} />
              <p className="nome-livro">{book.titulo}</p>
              <p className="nome-livro">{book.autor}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Search;
