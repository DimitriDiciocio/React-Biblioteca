import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface Tag {
  id: number;
  nome: string;
}

interface Book {
  id_reserva: number;
  id_usuario: number;
  id_livro: number;
  data_adicionado: string;
  imagem: string;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string;
  qtd_disponivel: string;
  descricao: string;
  selectedTags: Tag[];
  ano_publicado: string;
}

const Carrinho: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/carrinho_reservas",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Erro ao buscar reservas");

        const result = await response.json();

        const mappedBooks = result.map((reserva: any) => ({
          id_reserva: reserva.id_reserva,
          id_usuario: reserva.id_usuario,
          id_livro: reserva.id_livro,
          data_adicionado: reserva.data_adicionado,
          imagem: reserva.imagem || "default.jpg",
          titulo: reserva.livro?.titulo || "Título Desconhecido",
          autor: reserva.livro?.autor || "Autor Desconhecido",
          categoria: reserva.livro?.categoria || "Sem Categoria",
          isbn: reserva.livro?.isbn || "Sem ISBN",
          qtd_disponivel: reserva.livro?.qtd_disponivel || "0",
          descricao: reserva.livro?.descricao || "Sem descrição disponível.",
          selectedTags: reserva.livro?.selectedTags || [],
          ano_publicado: reserva.livro?.ano_publicado || "Ano Desconhecido",
        }));

        setBooks(mappedBooks);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: `Falha na listagem de livros. Tente novamente mais tarde.`,
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [navigate, token]);

  const reservarLivros = async () => {
    if (books.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrinho vazio",
        text: "Adicione livros ao carrinho antes de reservar.",
      });
      return;
    }

    const confirmacao = await Swal.fire({
      title: "Confirmar Reserva?",
      text: "Todos os itens do carrinho serão reservados.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sim, reservar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacao.isConfirmed) return;

    setReserving(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/reservar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ DATA_VALIDADE: "2025-12-31" }),
      });

      if (!response.ok) throw new Error("Erro ao reservar os livros");

      setBooks([]); // Limpa o carrinho após reserva bem-sucedida

      Swal.fire({
        icon: "success",
        title: "Reserva Confirmada!",
        text: "Os livros foram reservados com sucesso.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível reservar os livros. Tente novamente.",
      });
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  const removerLivro = async (id_reserva: number) => {
    const confirmacao = await Swal.fire({
      title: "Remover Livro?",
      text: "Tem certeza de que deseja remover este livro do carrinho?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
    });
  
    if (!confirmacao.isConfirmed) return;
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/carrinho_reservas/${id_reserva}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Erro ao remover livro");
  
      // Atualiza a lista removendo o livro excluído
      setBooks((prevBooks) => prevBooks.filter((book) => book.id_reserva !== id_reserva));
  
      Swal.fire({ icon: "success", title: "Removido!", text: "O livro foi removido do carrinho." });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Erro", text: "Não foi possível remover o livro." });
    }
  };
  

  return (
    <div>
      <h1>Livros no Carrinho</h1>

      {books.length > 0 && (
        <button
          onClick={reservarLivros}
          disabled={reserving}
          style={{
            backgroundColor: reserving ? "gray" : "green",
            color: "white",
            padding: "10px 15px",
            marginBottom: "15px",
            border: "none",
            cursor: reserving ? "not-allowed" : "pointer",
            borderRadius: "5px",
          }}
        >
          {reserving ? "Reservando..." : "Reservar Todos"}
        </button>
      )}

      {books.length === 0 ? (
        <p>Nenhum livro no carrinho.</p>
      ) : (
        <div>
          {books.map((book) => (
            <div
              key={book.id_reserva}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px 0",
              }}
            >
              <img
                src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`}
                alt={book.titulo}
                style={{ width: "100px", height: "150px" }}
              />
              <h2>{book.titulo}</h2>
              <p>
                <strong>Autor:</strong> {book.autor}
              </p>
              <p>
                <strong>Categoria:</strong> {book.categoria}
              </p>
              <p>
                <strong>Ano Publicado:</strong> {book.ano_publicado}
              </p>
              <p>
                <strong>Descrição:</strong> {book.descricao}
              </p>
              <p>
                <strong>Quantidade Disponível:</strong> {book.qtd_disponivel}
              </p>
              <p>
                <strong>Data Adicionado:</strong> {book.data_adicionado}
              </p>
              <div>
                <strong>Tags:</strong>
                {book.selectedTags.length > 0 ? (
                  book.selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      style={{
                        marginLeft: "5px",
                        padding: "2px 5px",
                        border: "1px solid #000",
                        borderRadius: "5px",
                      }}
                    >
                      {tag.nome}
                    </span>
                  ))
                ) : (
                  <span> Nenhuma tag disponível </span>
                )}
              </div>
              <button
                onClick={() => removerLivro(book.id_reserva)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "5px",
                  marginLeft: "10px",
                }}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Carrinho;
