import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import './Search.css';
import Tags from "../components/Tags";
import readRaccoonSad from "../../assets/img/red-racoon-sad.png";

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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [formData, setFormData] = useState({
    tag: "",
    autor: "",
    ano_publicacao: "",
    isbn: "",
    categoria: "",
    idioma: "",
  });

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const searchBooks = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/livros/pesquisa/${page}`, {
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
      
      if (!data.resultados || data.resultados.length === 0) {
        setHasMore(false);
        if (page === 1) {
          setBooks([]);
        }
        return;
      }

      setBooks(prevBooks => {
        const newBooks = data.resultados.filter((newBook: Book) => 
          !prevBooks.some(existingBook => existingBook.id === newBook.id)
        );
        return page === 1 ? data.resultados : [...prevBooks, ...newBooks];
      });
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
      setHasMore(false);
      if (page === 1) {
        setBooks([]);
      }
    } finally {
      setLoading(false);
    }
  }, [search, formData, selectedTags, page, hasMore, loading]);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const threshold = document.documentElement.offsetHeight - 100;
    
    if (scrollPosition >= threshold) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    // Reset states when search or filters change
    setPage(1);
    setHasMore(true);
    setBooks([]);
  }, [search, formData, selectedTags]);

  useEffect(() => {
    searchBooks();
  }, [page, searchBooks]);

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  useEffect(() => {
    // Escuta o evento customizado para abrir/fechar a aside de filtros
    const handleToggleAside = () => setIsSidebarOpen(prev => !prev);
    window.addEventListener("togglePesquisaAside", handleToggleAside);
    return () => window.removeEventListener("togglePesquisaAside", handleToggleAside);
  }, []);

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
            <input className="montserrat-alternates" type="text" placeholder="Autor..." value={formData.autor} onChange={(e) => setFormData(prev => ({ ...prev, autor: e.target.value }))} />
            <input className="montserrat-alternates" type="text" placeholder="Ano de publicação..." value={formData.ano_publicacao} onChange={(e) => setFormData(prev => ({ ...prev, ano_publicacao: e.target.value }))} />
            <input className="montserrat-alternates" type="text" placeholder="ISBN..." value={formData.isbn} onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))} />
            <select className="montserrat-alternates" value={formData.categoria} onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}>
              <option className="montserrat-alternates" value="">Categoria</option>
              <option className="montserrat-alternates" value="Livro">Livro</option>
              <option className="montserrat-alternates" value="Artigo Científico">Artigo Científico</option>
              <option className="montserrat-alternates" value="Jornal">Jornal</option>
              <option className="montserrat-alternates" value="Quadrinhos">Quadrinhos</option>
            </select>
            <select className="montserrat-alternates" value={formData.idioma} onChange={(e) => setFormData(prev => ({ ...prev, idioma: e.target.value }))}>
              <option className="montserrat-alternates" value="">Idioma</option>
              <option className="montserrat-alternates" value="Português">Português</option>
              <option className="montserrat-alternates" value="Inglês">Inglês</option>
              <option className="montserrat-alternates" value="Espanhol">Espanhol</option>
              <option className="montserrat-alternates" value="Francês">Francês</option>
            </select>
          </div>
        )}
      </aside>

      <main className="main-content background-blue vh86">
        <div className=
        {`livros-grid2 ${
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
        {books.length === 0 && !loading && (
            <div className="center-x center-y d-flex-column-no-font vh50">
            <img className="read-raccoon-sad center-x center-y" src={readRaccoonSad} alt="Read Raccoon triste" />
            <p className="mensagem-erro montserrat-alternates-semibold center-x">Nenhum livro encontrado.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default Search;