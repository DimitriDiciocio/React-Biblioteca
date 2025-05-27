import React, { useState, useEffect } from "react";
import OwlCarousel from "react-owl-carousel";
import { useNavigate } from "react-router-dom";
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
  imagem: string;
  selectedTags?: Tag[];
}

const MinhaListaCarrossel: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [visivel, setVisivel] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch("http://127.0.0.1:5000/livros/minhalista", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setVisivel(false);
          }
          throw new Error("Erro ao buscar livros");
        }

        const data = await response.json();
        
        if ('visivel' in data && !data.visivel) {
          setVisivel(false);
          return;
        }

        setBooks(data);
      } catch (error) {
        console.error("Erro ao carregar livros:", error);
        setVisivel(false);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const handleRemoveFromList = async (bookId: number, bookTitle: string) => {
    if (window.confirm(`Deseja remover "${bookTitle}" da sua lista?`)) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/livros/minhalista/excluir/${bookId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          setBooks(books.filter(book => book.id !== bookId));
        } else {
          throw new Error("Erro ao remover livro da lista");
        }
      } catch (error) {
        console.error("Erro ao remover livro:", error);
      }
    }
  };

  if (!visivel || (!loading && books.length === 0)) {
    return null;
  }

  return (
    <>
      {visivel && books.length > 0 && (
        <>
          <div>
            <p className="montserrat-alternates-semibold size-titles">
              Minha Lista de Leitura
            </p>
            {loading ? (
              <p className="montserrat-alternates">Carregando livros...</p>
            ) : (
              <OwlCarousel
                className="owl-carousel change"
                loop={false}
                nav
                dots={false}
                autoplay={false}
                stagePadding={50}
                responsive={{
                  0: { items: 1, nav: false },
                  480: { items: 3, nav: false },
                  950: { items: 4, nav: true },
                  1200: { items: 6, nav: true },
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
            )}
          </div>
          <div className="space-med-y"></div>
        </>
      )}
    </>
  );
};

export default MinhaListaCarrossel;
