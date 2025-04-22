import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeletarLivro from "../components/AlterarDisponibilidade";
import { usePermission } from "../components/usePermission";

const Livros: React.FC = () => {
  const token = localStorage.getItem("token");
  const [livros, setLivros] = useState<Book[]>([]);
  const [pesquisa, setPesquisa] = useState("");
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

  const fetchLivros = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/livrosadm", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erro ao buscar livros");
      const data = await response.json();
      setLivros(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLivros();
  }, [token]);

  const filteredLivros = pesquisa
    ? livros.filter(
        (book) =>
          book.id.toString().includes(pesquisa) ||
          book.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.autor.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.categoria.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.isbn.includes(pesquisa)
      )
    : livros;

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div className="livros-container">
      <i className="fa-solid fa-arrow-left arrow-back"  onClick={() => navigate("/home_biblio?page=1")}></i>
      <h1 className="page-title">Gerenciamento de Livros</h1>
      <input
        type="text"
        placeholder="Pesquisar livros"
        className="input pesquisa"
        onChange={(e) => setPesquisa(e.target.value)}
      />
      <div
        className={`livros-grid ${
          filteredLivros.length === 1
            ? "single-book"
            : filteredLivros.length === 2
            ? "two-books"
            : filteredLivros.length === 3
            ? "three-books"
            : ""
        }`}
      >
        {filteredLivros.map((book) => (
          <div key={book.id} className="livro-card">
            <img
              src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
              alt={book.titulo}
              className="livro-imagem"
            />
            <div className="livro-info">
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
                >
                  <span className="material-icons">edit</span>
                </button>
                <DeletarLivro id_livro={book.id} onStatusChange={fetchLivros} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Livros;
