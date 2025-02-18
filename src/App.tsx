import React, { useEffect, useState } from 'react';
import AddBooks from './AddBooks';

const App: React.FC = () => {

  interface Tag {
    id: number;
    nome: string;
  }

  interface Book {
    titulo:string, 
    autor:string, 
    categoria:string, 
    isbn:string, 
    qtd_disponivel:string, 
    descricao:string, 
    selectedTags:Tag[]
  }

    const [books, setBooks] = useState<Book[]>([]);
    useEffect(() => {
      async function fetchBooks() {
          const response = await fetch('http://127.0.0.1:5000/livros', {method:'GET'});
          const data = await response.json();
          setBooks(data);
      }
      fetchBooks();
  }, []);
    

  function onAddBookSubmit(titulo:string, autor:string, categoria:string, isbn:string, qtd_disponivel:string, descricao:string, selectedTags:Tag[]) {
    const newBook = {
      titulo,
      autor,
      categoria,
      isbn,
      qtd_disponivel,
      descricao,
      selectedTags
    };
    setBooks([...books, newBook]);
    
  }

  return (
    <div>
      <AddBooks onAddBookSubmit={onAddBookSubmit}/>
    </div>
  );
}

export default App;
