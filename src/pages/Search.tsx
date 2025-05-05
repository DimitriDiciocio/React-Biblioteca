import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import './Search.css';
import Tags from "../components/Tags";

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
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const [books, setBooks] = useState<Book[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    tag: "",
    autor: "",
    ano_publicacao: "",
    isbn: "",
    categoria: "",
    idioma: "",
  });

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const searchBooks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/livros/pesquisa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            pesquisa: search,
            filtros: {
              ...formData,
              tags: selectedTags.map(tag => tag.nome),
            }
          }),          
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          throw new Error(errorMessage.message || "Erro na requisição.");
        }

        const data = await response.json();
        setBooks(data.resultados);
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        setBooks([]);
      }
    };

    searchBooks();
  }, [search, formData, selectedTags]);

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  return (
    <div>
      <Header />
      <aside className={`sidebarSearch ${isSidebarOpen ? "open" : "closed"}`}>
        
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? "✕" : "☰"}
        </button>
        {isSidebarOpen && (
          <div className="filter-content">
            <label className="montserrat-alternates-semibold">Tags:</label>
            <div
              style={{
                width: "913px",
                maxWidth: "100%",
                padding: "0",
              }}
            >
              <Tags
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
              />
            </div>
            <input type="text" placeholder="Autor..." value={formData.autor} onChange={(e) => setFormData(prev => ({ ...prev, autor: e.target.value }))} />
            <input type="text" placeholder="Ano de publicação..." value={formData.ano_publicacao} onChange={(e) => setFormData(prev => ({ ...prev, ano_publicacao: e.target.value }))} />
            <input type="text" placeholder="ISBN..." value={formData.isbn} onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))} />
            <select value={formData.categoria} onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}>
              <option value="">Categoria</option>
              <option value="Livro">Livro</option>
              <option value="Artigo Científico">Artigo Científico</option>
              <option value="Jornal">Jornal</option>
              <option value="Quadrinhos">Quadrinhos</option>
            </select>
            <select value={formData.idioma} onChange={(e) => setFormData(prev => ({ ...prev, idioma: e.target.value }))}>
              <option value="">Idioma</option>
              <option value="Português">Português</option>
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Francês">Francês</option>
            </select>
          </div>
        )}
      </aside>

      <main className="main-content background-blue vh86">
        <div className=
        {`livros-grid ${
          books.length === 1
            ? "single-book"
            : books.length === 2
            ? "two-books"
            : books.length === 3
            ? "three-books"
            : ""
        }`}
        >
          {books.map((book, index) => (
            <div key={index} className="livro-card pointer" onClick={() => navigate(`/livro/${book.id}`)}>
              <img
                src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
                alt={book.titulo}
                className="livro-imagem"
              />
              <div className="livro-info">
                <h3>{book.titulo}</h3>
                <p><strong>Autor:</strong> {book.autor}</p>
                <p><strong>Categoria:</strong> {book.categoria}</p>
                <p><strong>ISBN:</strong> {book.isbn}</p>
              </div>
            </div>
          ))}
        </div>
        {books.length === 0 && (
          <p className="mensagem-erro">Nenhum livro encontrado.</p>
        )}
      </main>
    </div>
  );
};

export default Search;