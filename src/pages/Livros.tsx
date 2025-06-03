import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeletarLivro from "../components/AlterarDisponibilidade";
import { usePermission } from "../components/usePermission";

const Livros: React.FC = () => {
  const token = localStorage.getItem("token");
  const [livros, setLivros] = useState<Book[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtros, setFiltros] = useState({});
  const isAllowed = usePermission(2);
  const navigate = useNavigate();

  interface Book {
    id: number;
    titulo: string;
    autor: string;
    categoria: string;
    isbn: string;
    qtd_disponivel: number;
    descricao: string;
    imagem: string;
    disponivel: boolean;
  }

  const fetchLivros = async (pageNumber: number, pesquisaTerm: string = "", filtrosData: any = {}) => {
    try {
      let url = `http://127.0.0.1:5000/livrosadm/${pageNumber}`;
      let options: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (pesquisaTerm || Object.keys(filtrosData).length > 0) {
        url = `http://127.0.0.1:5000/livros/pesquisa/gerenciar/${pageNumber}`;
        options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pesquisa: pesquisaTerm,
            filtros: filtrosData,
          }),
        };
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 404) {
          setHasMore(false);
        }
        throw new Error("Erro ao buscar livros");
      }
      const data = await response.json();

      const resultados = data.resultados || data; // Handle both API responses
      if (resultados.length === 0) {
        setHasMore(false);
        return;
      }

      setLivros((prevLivros) => {
        const newLivros = resultados.filter(
          (newBook) => !prevLivros.some((existingBook) => existingBook.id === newBook.id)
        );
        return [...prevLivros, ...newLivros];
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLivros(page, pesquisa, filtros);
  }, [page, pesquisa, filtros]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  }, [hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPesquisa(e.target.value);
    setPage(1);
    setLivros([]);
    setHasMore(true);
  };

  const handleStatusChange = (id_livro: number, disponivel: boolean) => {
    setLivros((prevLivros) =>
      prevLivros.map((book) =>
        book.id === id_livro ? { ...book, disponivel: !disponivel } : book
      )
    );
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="livros-container montserrat-alternates">
      <i className="fa-solid fa-arrow-left arrow-back montserrat-alternates" onClick={() => navigate("/home_biblio?page=1")}></i>
      <h1 className="page-title montserrat-alternates-semibold">Gerenciamento de Livros</h1>
      <input
        type="text"
        placeholder="Pesquisar livros"
        className="input pesquisa montserrat-alternates"
        onChange={handleSearchChange}
      />
      <div
        className={`livros-grid2 montserrat-alternates ${
          livros.length === 1
            ? "single-book"
            : livros.length === 2
            ? "two-books"
            : livros.length === 3
            ? "three-books"
            : ""
        }`}
      >
        {livros.map((book) => (
          <div key={book.id} className="livro-card">
            <img
              src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
              alt={book.titulo}
              className="livro-imagem"
            />
            <div className="livro-info montserrat-alternates">
              <h3>{book.titulo}</h3>
              <p>
                <strong>Autor:</strong> {book.autor}
              </p>
              <p>
                <strong>Categoria:</strong> {book.categoria}
              </p>
              <p>
                <strong>ISBN:</strong> {book.isbn}
              </p>
              <p>
                <strong>Disponível:</strong> {book.disponivel ? "Sim" : "Não"}
              </p>
              <div className="livro-acoes">
                <button
                  onClick={() =>
                  (window.location.href = `/editar_livro/${book.id}`)
                  }
                  className="btn btn-primary"
                  title="Editar livro"
                >
                  <span className="material-icons">edit</span>
                </button>
                <DeletarLivro
                  id_livro={book.id}
                  disponivel={book.disponivel}
                  onStatusChange={() => handleStatusChange(book.id, book.disponivel)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMore && <p>Carregando mais livros...</p>}
    </div>
  );
};

export default Livros;
