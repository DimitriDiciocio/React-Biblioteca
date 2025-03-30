import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../Header";

interface Tag {
  id: number;
  nome: string;
}

interface Book {
  id_reserva?: number;
  id_emprestimo?: number;
  id_usuario: number;
  id_livro: number;
  data_adicionado: string;
  imagem: string;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string;
  selectedTags: Tag[];
}

const Carrinho: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [reservas, setReservas] = useState<Book[]>([]);
  const [emprestimos, setEmprestimos] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/carrinho_reservas", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Erro ao buscar reservas");

        const result = await response.json();
        setReservas(result.map((reserva: any) => ({
          id_reserva: reserva.id_reserva,
          id_usuario: reserva.id_usuario,
          id_livro: reserva.id_livro,
          data_adicionado: reserva.data_adicionado,
          imagem: reserva.imagem || "default.jpg",
          titulo: reserva.livro?.titulo || "Título Desconhecido",
          autor: reserva.livro?.autor || "Autor Desconhecido",
          categoria: reserva.livro?.categoria || "Sem Categoria",
          isbn: reserva.livro?.isbn || "Sem ISBN",
          selectedTags: reserva.livro?.selectedTags || [],
        })));
      } catch {
        Swal.fire({ icon: "error", title: "Erro", text: "Falha ao buscar reservas." });
        navigate("/");
      }
    };

    const fetchEmprestimos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/carrinho_emprestimos", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Erro ao buscar empréstimos");

        const result = await response.json();
        setEmprestimos(result.map((emprestimo: any) => ({
          id_emprestimo: emprestimo.id_emprestimo,
          id_usuario: emprestimo.id_usuario,
          id_livro: emprestimo.id_livro,
          data_adicionado: emprestimo.data_adicionado,
          imagem: emprestimo.imagem || "default.jpg",
          titulo: emprestimo.livro?.titulo || "Título Desconhecido",
          autor: emprestimo.livro?.autor || "Autor Desconhecido",
          categoria: emprestimo.livro?.categoria || "Sem Categoria",
          isbn: emprestimo.livro?.isbn || "Sem ISBN",
          selectedTags: emprestimo.livro?.selectedTags || [],
        })));
      } catch {
        Swal.fire({ icon: "error", title: "Erro", text: "Falha ao buscar empréstimos." });
        navigate("/");
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await fetchReservas();
      await fetchEmprestimos();
      setLoading(false);
    };

    fetchData();
  }, [navigate, token]);

  const removerLivro = async (id: number, tipo: "reserva" | "emprestimo") => {
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
      const endpoint =
        tipo === "reserva"
          ? `http://127.0.0.1:5000/carrinho_reservas/${id}`
          : `http://127.0.0.1:5000/carrinho_emprestimos/${id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao remover livro");

      tipo === "reserva"
        ? setReservas((prev) => prev.filter((book) => book.id_reserva !== id))
        : setEmprestimos((prev) => prev.filter((book) => book.id_emprestimo !== id));

      Swal.fire({ icon: "success", title: "Removido!", text: "O livro foi removido do carrinho." });
    } catch {
      Swal.fire({ icon: "error", title: "Erro", text: "Não foi possível remover o livro." });
    }
  };

  const reservarLivros = async () => {
    if (reservas.length === 0) {
      Swal.fire({ icon: "warning", title: "Carrinho vazio", text: "Adicione livros antes de reservar." });
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
      await fetch("http://127.0.0.1:5000/reservar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ DATA_VALIDADE: "2025-12-31" }),
      });

      setReservas([]);

      Swal.fire({ icon: "success", title: "Reserva Confirmada!", text: "Os livros foram reservados com sucesso." });
    } catch {
      Swal.fire({ icon: "error", title: "Erro", text: "Não foi possível reservar os livros." });
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  const emprestarLivros = async () => {
    if (emprestimos.length === 0) {
      Swal.fire({ icon: "warning", title: "Carrinho vazio", text: "Adicione livros antes de reservar." });
      return;
    }

    const confirmacao = await Swal.fire({
      title: "Confirmar Emprestimo?",
      text: "Todos os itens do carrinho serão reservados.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sim, emprestar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacao.isConfirmed) return;

    setBorrowing(true);

    try {
      await fetch("http://127.0.0.1:5000/emprestar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      setEmprestimos([]);

      Swal.fire({ icon: "success", title: "Empretimo Confirmado!", text: "Os livros foram emprestados com sucesso." });
    } catch {
      Swal.fire({ icon: "error", title: "Erro", text: "Não foi possível emprestar os livros." });
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <Header/>
      <div className="espaco-vazio"></div>

      <h1>Seu Carrinho</h1>

      <section>
        <h2>Livros Reservados</h2>
        {reservas.length === 0 ? (
          <p>Nenhum livro reservado.</p>
        ) : (
          reservas.map((book) => (
            <div key={book.id_reserva}>
              <img src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`} alt={book.titulo} width="100" />
              <h3>{book.titulo}</h3>
              <p>{book.autor}</p>
              <button onClick={() => removerLivro(book.id_reserva!, "reserva")}>Remover</button>
            </div>
          ))
        )}
        {reservas.length > 0 && <button onClick={reservarLivros} disabled={reserving}>Reservar Todos</button>}
      </section>

      <section>
        <h2>Livros Emprestados</h2>
        {emprestimos.length === 0 ? (
          <p>Nenhum livro emprestado.</p>
        ) : (
          emprestimos.map((book) => (
            <div key={book.id_emprestimo}>
              <img src={`http://127.0.0.1:5000/uploads/livros/${book.imagem}`} alt={book.titulo} width="100" />
              <h3>{book.titulo}</h3>
              <p>{book.autor}</p>
              <button onClick={() => removerLivro(book.id_emprestimo!, "emprestimo")}>Remover</button>
            </div>
          ))
        )}
        {emprestimos.length > 0 && <button onClick={emprestarLivros} disabled={borrowing}>Emprestar Todos</button>}
      </section>
    </div>
  );
};

export default Carrinho;
