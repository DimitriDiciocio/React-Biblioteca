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
  livro?: {
    titulo?: string;
    autor?: string;
    categoria?: string;
    isbn?: string;
    selectedTags?: Tag[];
  };
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
        setReservas(result.map((reserva: Book) => ({
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
        setEmprestimos(result.map((emprestimo: Book) => ({
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

      void (tipo === "reserva"
        ? setReservas((prev) => prev.filter((book) => book.id_reserva !== id))
        : setEmprestimos((prev) => prev.filter((book) => book.id_emprestimo !== id)));

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
  
    setReserving(true);
  
    try {
      // Verificar a disponibilidade de todos os livros antes de reservar
      const indisponiveis = [];
      const verificacoes = await Promise.all(
        reservas.map(async (book) => {
          const response = await fetch(`http://127.0.0.1:5000/verificar_reserva/${book.id_livro}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
  
          if (!response.ok) throw new Error("Erro ao verificar disponibilidade");
  
          const result = await response.json();
          if (!result.disponivel) indisponiveis.push(book);
          return result.disponivel;
        })
      );
  
      // Se houver livros indisponíveis, oferecer opções ao usuário
      if (indisponiveis.length > 0) {
        const { isConfirmed, dismiss } = await Swal.fire({
          title: "Alguns livros não estão disponíveis",
          html: `<p>Os seguintes livros não podem ser reservados:</p><ul>${indisponiveis.map(book => `<li>${book.titulo}</li>`).join('')}</ul><p>Deseja removê-los e continuar?</p>`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Remover indisponíveis e continuar",
          cancelButtonText: "Cancelar",
          showDenyButton: true,
          denyButtonText: "Escolher livros para remover",
        });
  
        if (dismiss === Swal.DismissReason.cancel) {
          setReserving(false);
          return;
        }
  
        if (isConfirmed) {
          // Remover livros indisponíveis usando a função removerLivro
          for (const book of indisponiveis) {
            // Remover livro da reserva
            await removerLivro(book.id_reserva!, "reserva");
          }
        } else if (dismiss === Swal.DismissReason.deny) {
          // Oferecer ao usuário a possibilidade de remover livros um por um
          for (const book of indisponiveis) {
            const { isConfirmed } = await Swal.fire({
              title: `Remover ${book.titulo}?`,
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Sim, remover",
              cancelButtonText: "Não, manter",
            });
  
            if (isConfirmed) {
              // Remover livro da reserva
              await removerLivro(book.id_reserva!, "reserva");
            }
          }
        }
      }
  
      // Prosseguir com a reserva se todos os livros restantes estiverem disponíveis
      const confirmacao = await Swal.fire({
        title: "Confirmar Reserva?",
        text: "Todos os itens do carrinho serão reservados.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Sim, reservar",
        cancelButtonText: "Cancelar",
      });
  
      if (!confirmacao.isConfirmed) {
        setReserving(false);
        return;
      }
  
      // Realizar a reserva após a verificação de disponibilidade
      const response = await fetch("http://127.0.0.1:5000/reservar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      if (response.ok) {
        setReservas([]);
        Swal.fire({ icon: "success", title: "Reserva Confirmada!", text: "Os livros foram reservados com sucesso." });
      } else {
        Swal.fire({ icon: "error", title: "Erro", text: String(data.message) });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Erro", text: String(error) });
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
  
    // Verificar a disponibilidade de todos os livros
    const indisponiveis = [];
    for (const livro of emprestimos) {
      const response = await fetch(`http://127.0.0.1:5000/verificar_emprestimo/${livro.id_livro}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
  
      const result = await response.json();
      if (!result.disponivel) {
        indisponiveis.push(livro);
      }
    }
  
    // Se houver livros indisponíveis, perguntar ao usuário
    if (indisponiveis.length > 0) {
      const confirmacao = await Swal.fire({
        title: "Livros Indisponíveis",
        text: `Os seguintes livros não estão disponíveis para empréstimo:\n${indisponiveis.map((livro) => livro.titulo).join(", ")}\nDeseja remover esses livros e continuar com a reserva?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover e continuar",
        cancelButtonText: "Cancelar",
      });
  
      if (confirmacao.isConfirmed) {
        // Remover livros indisponíveis do carrinho
        for (const livro of indisponiveis) {
          // Remover livro usando a função removerLivro
          await removerLivro(livro.id_emprestimo!, "emprestimo");
        }
  
        // Continuar com o empréstimo após a remoção dos livros indisponíveis
        try {
          await fetch("http://127.0.0.1:5000/emprestar", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
  
          setEmprestimos([]); // Limpar o carrinho após o empréstimo
          Swal.fire({ icon: "success", title: "Empréstimo Confirmado!", text: "Os livros foram emprestados com sucesso." });
        } catch {
          Swal.fire({ icon: "error", title: "Erro", text: "Não foi possível emprestar os livros." });
        }
      }
    } else {
      // Se todos os livros estão disponíveis
      const confirmacao = await Swal.fire({
        title: "Confirmar Empréstimo?",
        text: "Todos os itens do carrinho serão emprestados.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Sim, emprestar",
        cancelButtonText: "Cancelar",
      });
  
      if (!confirmacao.isConfirmed) return;
  
      try {
        const response = await fetch("http://127.0.0.1:5000/emprestar", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await response.json();
  
        if (response.ok) {
          setEmprestimos([]);
          Swal.fire({ icon: "success", title: "Empréstimo Confirmado!", text: "Os livros foram emprestados com sucesso." }); 
        } else {
          Swal.fire({ icon: "error", title: "Erro", text: String(data.message) }); 
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Erro", text: String(error) });
      }
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
