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
import EditarLivro from './pages/EditarLivro';
import Usuarios from './pages/Usuarios';
import MostrarUsuarios from './pages/MostrarUsuários';
import PuxarHistorico from './pages/PuxarHistorico';
import Search from './pages/Search';
import CadastroUsuario from './pages/CadastroUsuario';
import Carrinho from './pages/Carrinho';
import HomeBiblio from './pages/HomeBiblio';

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
          <Route path="/relatorios" element={<Relatorios/>} />
          <Route path="/livro/:id" element={<BookDetail />} />
          <Route path="/editar_livro/:id" element={<EditarLivro />} />
          <Route path="/sair" element={<Sair/>}/>
          <Route path="/usuarios/:id" element={<Usuarios/>}/>
          <Route path="/usuarios" element={<MostrarUsuarios/>}/>
          <Route path="/historico" element={<PuxarHistorico/>}/>
          <Route path="/pesquisa/:search" element={<Search/>}/>
          <Route path="/cadastrar_usuario" element={<CadastroUsuario/>}/>
          <Route path="/carrinho" element={<Carrinho/>}/>
          <Route path="/home_biblio" element={<HomeBiblio/>}/>
        </Routes>
    </Router>
  )
};

export default App;