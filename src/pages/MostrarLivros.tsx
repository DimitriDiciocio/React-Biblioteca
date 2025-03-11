import React, { useState, useEffect } from 'react';
import Tags from '../Tags';
import { Link } from 'react-router-dom';

const MostrarLivros = () => {
    const [books, setBooks] = useState<Book[]>([]);

    interface Tag {
        id: number;
        nome: string;
      }
    
      interface Book {
        id: number,
        titulo: string,
        autor: string,
        categoria: string,
        isbn: string,
        qtd_disponivel: string,
        descricao: string,
        selectedTags: Tag[],
        image_path: string
      }

    useEffect(() => {
        async function fetchBooks() {
          const response = await fetch('http://127.0.0.1:5000/livros', { method: 'GET' });
          const data = await response.json();
          setBooks(data);
        }
        fetchBooks();
      }, []);
    return (
        <div className='d-flex rolagem'>
          {books.map((book, index) => (
            <Link to={`/livro/${book.id}`} key={index} className="livro col-12">
              <img className="capa-livro" src={book.image_path} alt={book.titulo} />
              <p className="nome-livro">{book.titulo}</p>
              <p className="autor-livro">{book.autor}</p>
            </Link>
          ))}
        </div>
    );
    }

export default MostrarLivros;