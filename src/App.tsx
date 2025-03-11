// import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import AddBooks from './pages/AddBooks';
import Home from './pages/Home'
import EditarUsuario from './pages/EditarUsuario';
import Relatorios from './pages/Relatorios';
import BookDetail from './pages/DetalhesLivro';
import Sair from './pages/Sair';

const App: React.FC = () => {

  // interface Tag {
  //   id: number;
  //   nome: string;
  // }

  // interface Book {
  //   titulo: string,
  //   autor: string,
  //   categoria: string,
  //   isbn: string,
  //   qtd_disponivel: string,
  //   descricao: string,
  //   selectedTags: Tag[]
  // }

  // const [books, setBooks] = useState<Book[]>([]);

  // useEffect(() => {
  //   async function fetchBooks() {
  //     const response = await fetch('http://127.0.0.1:5000/livros', { method: 'GET' });
  //     const data = await response.json();
  //     setBooks(data);
  //   }
  //   fetchBooks();
  // }, []);


  return (
    <Router>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/editar" element={<EditarUsuario/>} />
          <Route path="/addLivro" element={<AddBooks/>} />
          <Route path="/Relatorios" element={<Relatorios/>} />
          <Route path="/livro/:id" element={<BookDetail />} />
          <Route path="/sair" element={<Sair/>}/>
        </Routes>
    </Router>
  )
};

export default App;