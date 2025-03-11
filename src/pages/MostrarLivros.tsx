import React, { useState, useEffect } from 'react';
import Tags from '../Tags';

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
        selectedTags: Tag[]
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
        <div>
        <h1>Livros</h1>
        <ul>
            {books.map((book) => (
            <li key={book.id}>{book.titulo}</li>
            ))}
        </ul>
        </div>
    );
    }

export default MostrarLivros;