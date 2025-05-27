import React, { useState, useEffect } from "react";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

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

const Novidades: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    let isMounted = true;

    async function fetchBooks() {
        try {
            const response = await fetch("http://127.0.0.1:5000/livros/novidades", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error("Erro ao buscar livros");            const livros = await response.json();
            if (isMounted) {
                setBooks(livros);
            }
        } catch (error) {
            if (isMounted) {
                console.error("Erro ao carregar livros:", error);
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    }

    fetchBooks();

    return () => {
        isMounted = false;
    };
}, []);

  if (books.length === 0 && !loading) {
    return null;
  }

  return (
    <section>
      <p className="montserrat-alternates-semibold size-titles">
        Novidades na Biblioteca
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
          stagePadding={50}
          slideBy={5}
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

export default Novidades;