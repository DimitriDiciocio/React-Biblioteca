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

const PorqueVoceLeu: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [livroTitulo, setLivroTitulo] = useState("");
  const [loading, setLoading] = useState(true);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch("http://127.0.0.1:5000/livros/porqueleu", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Erro ao buscar livros");

        const data = await response.json();
        setVisivel(data.visivel);

        if (data.visivel) {
          setBooks(data.livros);
          setLivroTitulo(data.livroAnalisado[1]);
        }
      } catch (error) {
        console.error("Erro ao carregar livros:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  if (!visivel) {
    return null;
  }

  return (
    <section>
      <p className="montserrat-alternates-semibold size-titles">
        Por que você leu <strong className="montserrat-alternates-bold">{livroTitulo}</strong>?
      </p>
      {loading ? (
        <p>Carregando livros...</p>
      ) : books.length > 0 ? (
        <OwlCarousel
          className="owl-carousel change"
          loop={false}
          nav
          dots={false}
          autoplay={false}
          slideBy={5}
          stagePadding={50}
          responsive={{
            0: { items: 1, nav: false },
            480: { items: 3, nav: false },
            950: { items: 4, nav: true },
            1200: { items: 6, nav: true },
          }}
        >
          {books.map((book) => (
            <div key={book.id}>
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
    </section>
  );
};

export default PorqueVoceLeu;
