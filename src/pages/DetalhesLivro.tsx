import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import DeletarLivro from "../DeletarLivro";

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
    ano_publicado: string; // A API retorna como string
    image_path: string;
}

const BookDetail = () => {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login'); // Redireciona para a página de login se não houver token
        }

    useEffect(() => {
        async function fetchBook() {
            try {
                const response = await fetch(`http://127.0.0.1:5000/livros/${id}`);
                if (!response.ok) throw new Error("Livro não encontrado");

                const data = await response.json();
                setBook(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchBook();
    }, [id]);

    if (loading) return <p>Carregando...</p>;
    if (!book) return <p>Livro não encontrado.</p>;

    return (
        <div>
            <h1>{book.titulo}</h1>
            <p><strong>Autor:</strong> {book.autor}</p>
            <p><strong>Categoria:</strong> {book.categoria}</p>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Quantidade disponível:</strong> {book.qtd_disponivel}</p>
            <p><strong>Ano:</strong> {new Date(book.ano_publicado).getFullYear()}</p>
            <p><strong>Resumo:</strong> {book.descricao}</p>
            {book.image_path && <img src={book.image_path} alt={book.titulo} />}
            <DeletarLivro id={book.id}/>
        </div>
    );
};

export default BookDetail;
