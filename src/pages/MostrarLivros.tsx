import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const MostrarLivros = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login'); // Redireciona para a página de login se não houver token
        }

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
        image_path: string;
    }

    // Abre uma nova aba com os detalhes do livro
    const handleOpenBook = (book: Book) => {
        const url = `/livro/${book.id}`;
        window.open(url, '_blank');
    };

    useEffect(() => {
        async function fetchBooks() {
            try {
                const response = await fetch('http://127.0.0.1:5000/livros');
                if (!response.ok) throw new Error('Erro ao buscar livros');
                const data = await response.json();
                setBooks(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchBooks();
    }, []);

    return (
        <div className='d-flex rolagem'>
            {books.map((book, index) => (
                <div key={index} className="livro col-12" onClick={() => handleOpenBook(book)} style={{ cursor: 'pointer' }}>
                    <img className="capa-livro" src={book.image_path} alt={book.titulo} />
                    <p className="nome-livro">{book.titulo}</p>
                    {book.selectedTags?.map((tag) => (
                        <p key={tag.id}>{tag.nome}</p>
                    ))}
                    <p className="autor-livro">{book.autor}</p>
                </div>
            ))}
        </div>
    );
};

export default MostrarLivros;
