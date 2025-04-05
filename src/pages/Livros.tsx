import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import DeletarLivro from "../components/DeletarLivro";
import { usePermission } from "../components/usePermission";

const Livros: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [livros, setLivros] = useState<Book[]>([]);
  const [filteredLivros, setFilteredLivros] = useState<Book[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const isAllowed = usePermission(2);

  interface Book {
    id: number;
    titulo: string;
    autor: string;
    categoria: string;
    isbn: string;
    qtd_disponivel: number;
    descricao: string;
    imagem: string;
  }

  useEffect(() => {
    async function fetchLivros() {
      try {
        const response = await fetch("http://127.0.0.1:5000/livros", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Erro ao buscar livros");
        const data = await response.json();
        setLivros(data);
        setFilteredLivros(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchLivros();
  }, [token]);

  useEffect(() => {
    if (pesquisa) {
      const filtered = livros.filter(
        (book) =>
          book.id.toString().includes(pesquisa) ||
          book.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.autor.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.categoria.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.isbn.includes(pesquisa)
      );
      setFilteredLivros(filtered);
    } else {
      setFilteredLivros(livros);
    }
  }, [pesquisa, livros]);

  const handleOpenBook = (book: Book) => {
    const url = `/editar_livro/${book.id}`;
    window.location.href = url;
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <Header />
      <div className="espaco-vazio"></div>

      <h1>Gerenciamento de Livros</h1>
      <input
        type="text"
        placeholder="Pesquisar livros"
        onChange={(e) => setPesquisa(e.target.value)}
      />
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Categoria</th>
            <th>ISBN</th>
            <th>Qtd. Disponível</th>
            <th>Descrição</th>
            <th>Imagem</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredLivros.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.titulo}</td>
              <td>{book.autor}</td>
              <td>{book.categoria}</td>
              <td>{book.isbn}</td>
              <td>{book.qtd_disponivel}</td>
              <td>{book.descricao}</td>
              <td>
                <img
                  src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
                  alt={book.titulo}
                  width="50"
                />
              </td>
              <td>
                <button
                  onClick={() => handleOpenBook(book)}
                  className="btn btn-primary"
                >
                  <span className="material-icons">edit</span>
                </button>
                <DeletarLivro id_livro={book.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Livros;
