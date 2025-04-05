import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/Header";
import { usePermission } from "../components/usePermission";

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
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const filtros = queryParams.get("filters")?.split(",") || [];
  const [books, setBooks] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false); // Novo estado para controlar a busca
  const token = localStorage.getItem("token");
  const isAllowed = usePermission(1);

  const handleOpenBook = (book: Book) => {
    navigate(`/livro/${book.id}`);
  };

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
          const errorMessage = await response.json();
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: errorMessage.error || "Erro ao buscar livros",
          });
          return;
        }

        const data = await response.json();
        setBooks(data.resultados); // Definindo os livros obtidos
        setHasSearched(true); // Marcar que a busca foi realizada
      } catch (error) {
        const errorMessage =
          (error as Error).message || "Erro ao buscar livros";
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: errorMessage,
        });
      }
    };

    if (!hasSearched) {
      searchBooks();
    }
  }, [search, filtros, token, hasSearched]);

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <Header />
      <div className="espaco-vazio"></div>

      <h1>Search Page</h1>
      {books.map((book, index) => {
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
      })}
    </div>
  );
};

export default Search;
