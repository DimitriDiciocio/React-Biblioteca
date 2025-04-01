import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../Header";

const Livros: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Ajuste inicial para false

  useEffect(() => {
    const tokenIsActive = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          Swal.fire(
            "Erro",
            result.error || "Erro na verificação do token",
            "error"
          );
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        navigate("/login");
      }
    };

    tokenIsActive();
  }, [navigate, token]);

  useEffect(() => {
    const temPermissao = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/tem_permissao", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          navigate("/");
        }
      } catch (error) {
        console.error("Essa página é restrita:", error);
        navigate("/");
      }
    };

    temPermissao();
  }, [navigate, token]);

  const [livros, setLivros] = useState<Livro[]>([]);
  const [filteredLivros, setFilteredLivros] = useState<Livro[]>([]);

  interface Livro {
    id_livro: number;
    titulo: string;
    autor: string;
    genero: string;
    ano_publicacao: number;
    ativo: boolean;
  }

  const handleEdit = (livro: Livro) => {
    const url = `/editar_livro/${livro.id_livro}`;
    window.location.href = url;
  };

  const handleDelete = async (livro: Livro) => {
    const confirmacao = await Swal.fire({
      title: "Tem certeza?",
      text: "Essa ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacao.isConfirmed) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/deletar_livro", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id_livro: livro.id_livro }), // Enviando como JSON
      });

      if (response.ok) {
        await Swal.fire(
          "Deletado!",
          "O livro foi removido com sucesso.",
          "success"
        );
        setLivros((prevLivros) =>
          prevLivros.filter((book) => book.id_livro !== livro.id_livro)
        );
        setFilteredLivros((prevFiltered) =>
          prevFiltered.filter((book) => book.id_livro !== livro.id_livro)
        );
      } else {
        await Swal.fire("Erro!", "Não foi possível excluir o livro.", "error");
      }
    } catch (error) {
      console.error("Erro:", error);
      await Swal.fire(
        "Erro!",
        "Ocorreu um erro ao tentar excluir o livro.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchLivros() {
      try {
        const response = await fetch("http://127.0.0.1:5000/livros", {
          method: "get",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  }, []);

  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    if (pesquisa) {
      const filtered = livros.filter(
        (book) =>
          book.id_livro.toString().includes(pesquisa) ||
          book.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.autor.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.genero.toLowerCase().includes(pesquisa.toLowerCase()) ||
          book.ano_publicacao.toString().includes(pesquisa) ||
          (book.ativo ? "Ativo" : "Inativo")
            .toLowerCase()
            .includes(pesquisa.toLowerCase())
      );
      setFilteredLivros(filtered);
    } else {
      setFilteredLivros(livros);
    }
  }, [pesquisa, livros]);

  return (
    <div>
      <Header />

      <div className="espaco-vazio"></div>

      <h1>Livros</h1>
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
            <th>Gênero</th>
            <th>Ano de Publicação</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredLivros.map((book) => {
            return (
              <tr key={book.id_livro}>
                <td>{book.id_livro}</td>
                <td>{book.titulo}</td>
                <td>{book.autor}</td>
                <td>{book.genero}</td>
                <td>{book.ano_publicacao}</td>
                <td>{book.ativo ? "Ativo" : "Inativo"}</td>
                <td className="gap-botao">
                  <button
                    onClick={() => handleEdit(book)}
                    className="btn btn-primary"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(book)}
                    disabled={loading}
                    className="btn btn-danger"
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <span className="material-icons">delete</span>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Livros;