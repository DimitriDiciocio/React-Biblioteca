import { useParams } from "react-router-dom";

interface Book {
    id: number,
    titulo: string,
    autor: string,
    categoria: string,
    isbn: string,
    qtd_disponivel: string,
    descricao: string,
    selectedTags: Tag[],
    ano_publicado: Date,
    image_path: string
  }

  interface Tag {
    id: number;
    nome: string;
  }

const BookDetail = (books:Book[]) => {
  const { id } = useParams();
  const book = books.find((b) => b.id === parseInt(id || '0', 10));

  if (!book) {
    return <h2>Livro não encontrado!</h2>;
  }

  return (
    <div>
      <h1>{book.titulo}</h1>
      <p><strong>Autor:</strong> {book.autor}</p>
        <p><strong>Categoria:</strong> {book.categoria}</p>
        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Quantidade disponível:</strong> {book.qtd_disponivel}</p>
      <p><strong>Ano:</strong> {book.ano_publicado.getFullYear()}</p>
      <p><strong>Resumo:</strong> {book.descricao}</p>
    </div>
  );
};

export default BookDetail;
