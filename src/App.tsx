// import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import AddBooks from "./pages/AddBooks";
import Home from "./pages/Home";
import EditarUsuario from "./components/EditarUsuario";
import BookDetail from "./pages/DetalhesLivro";
import Sair from "./pages/Sair";
import EditarLivro from "./pages/EditarLivro";
import PuxarHistorico from "./components/PuxarHistorico";
import Search from "./pages/Search";
import CadastroUsuario from "./pages/CadastroUsuario";
import Carrinho from "./components/Carrinho";
import HomeBiblio from "./pages/HomeBiblio";
import Config from "./pages/Config";
import SemPermissao from "./pages/SemPermissao";
import DetalhesUsuario from "./pages/DetalhesUsuario";
import AddBanners from "./components/AddBanners";
import DetalhesBanner from "./pages/DetalhesBanner";
import RecuperarSenha from "./pages/RecuperarSenha";
import EsqueciSenha from "./pages/EsqueciSenha";
import VerificarCodigo from "./pages/VerificarCodigo";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/editar" element={<EditarUsuario />} />
        <Route path="/addLivro" element={<AddBooks />} />
        <Route path="/livro/:id" element={<BookDetail />} />
        <Route path="/editar_livro/:id" element={<EditarLivro />} />
        <Route path="/sair" element={<Sair />} />
        <Route path="/historico" element={<PuxarHistorico />} />
        <Route path="/pesquisa/:search" element={<Search />} />
        <Route path="/pesquisa/" element={<Search />} />
        <Route path="/cadastrar_usuario" element={<CadastroUsuario />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/home_biblio" element={<HomeBiblio />} />
        <Route path="/user" element={<Config />} />
        <Route path="/sem-permissao" element={<SemPermissao />} />
        <Route path="/usuarios/:id" element={<DetalhesUsuario />} />
        <Route path="/addBanners" element={<AddBanners />} />
        <Route path="/detalhesBanner/:id_banner" element={<DetalhesBanner />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/verificar-codigo/:id_usuario" element={<VerificarCodigo />} />
      </Routes>
    </Router>
  );
};

export default App;
