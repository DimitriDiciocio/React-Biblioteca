import React, { useState, useEffect } from "react";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

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

const MostrarLivros: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch("http://127.0.0.1:5000/livros");
        if (!response.ok) throw new Error("Erro ao buscar livros");

        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Erro ao carregar livros:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Carregando livros...</p>
      ) : books.length > 0 ? (
        <OwlCarousel
          className="owl-carousel change"
          loop={false}
          nav
          dots={false}
          autoplay={false}
          stagePadding={50}
          slideBy={5} 
          responsive={{
            0: { items: 1, nav: false, slideBy: 1 },
            480: { items: 3, nav: false, slideBy: 3 },
            950: { items: 4, nav: true, slideBy: 4 },
            1200: { items: 5, nav: true, slideBy: 5 },
          }}
        >
          {books.map((book, index) => (
            <div key={`${book.id}-${index}`} className="item">
              <div className="border-book">
          <a href={`/livro/${book.id}`} className="text-decoration-none">
            <div>
              <img
                src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
                alt={book.titulo}
              />
            </div>
          </a>
              </div>
              <a href={`/livro/${book.id}`} className="text-decoration-none">
          <p className="montserrat-alternates-semibold book-title-formatation">
            {book.titulo}
          </p>
              </a>
            </div>
          ))}
        </OwlCarousel>
      ) : (
        <p>Nenhum livro encontrado.</p>
      )}
    </div>
  );
};

export default MostrarLivros;
