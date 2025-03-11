import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Home: React.FC = () => {

  interface Tag {
    id: number;
    nome: string;
  }

  interface Book {
    titulo: string,
    autor: string,
    categoria: string,
    isbn: string,
    qtd_disponivel: string,
    descricao: string,
    selectedTags: Tag[]
  }

  const [books, setBooks] = useState<Book[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const navigate = useNavigate();

  const moveSlide = (index: number) => {
    setCurrentSlide(index);
  };

  function onAddBookSubmit(titulo: string, autor: string, categoria: string, isbn: string, qtd_disponivel: string, descricao: string, selectedTags: Tag[]) {
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
        <header className="container-fluid">
        <section className="row d-flex cabecalho-claro2">
            <div className="col-lg-5 col-sm-3 d-flex justify-content-center align-items-center">
            <img className="logo" src="assets/img/logo-branca.png" alt="logo do site" />
            </div>

            <div className="col-lg-6 col-sm-6 d-flex justify-content-center align-items-center">
            <input id="campo-busca" placeholder="O que você quer ler hoje?" />
            </div>
            <div className="col-lg-1 col-sm-3 justify-content-center align-items-center">
            <button onClick={() => navigate('/usuario/editar')} className='text-decoration-none'><i className="conta2">account_circle</i></button>
            <button onClick={() => navigate('/sair')} className='text-decoration-none'><i className="">Sair</i></button>
            </div>
        </section>

        <section className="row cabecalho-escuro2">
            <div className="col-12 d-flex align-items-center">
            <div className="d-flex navegacao2 align-items-center">
                <p>Genero</p>
                <i>arrow_drop_down</i>
            </div>
            <div className="d-flex navegacao2 align-items-center">
                <p>Minha lista</p>
                <i>list</i>
            </div>
            <div className="d-flex navegacao2 align-items-center">
                <p>Notificações</p>
                <i>notifications</i>
            </div>
            </div>
        </section>
        </header>

        <div className="espaco-vazio"></div>

        <main className="container-fluid">
        <section className="row">
            <div className="col-12 carousel">
            <div className="carousel-images">
                <img src="assets/img/carrossel1.png" alt="Imagem 1" style={{ display: currentSlide === 0 ? 'block' : 'none' }} />
                <img src="assets/img/carrossel2.png" alt="Imagem 2" style={{ display: currentSlide === 1 ? 'block' : 'none' }} />
                <img src="assets/img/carrossel3.png" alt="Imagem 3" style={{ display: currentSlide === 2 ? 'block' : 'none' }} />
                <img src="assets/img/carrossel4.png" alt="Imagem 4" style={{ display: currentSlide === 3 ? 'block' : 'none' }} />
                <img src="assets/img/carrossel5.png" alt="Imagem 5" style={{ display: currentSlide === 4 ? 'block' : 'none' }} />
            </div>
            </div>

            <div className="col-12 dots">
            <span className="dot" onClick={() => moveSlide(0)}></span>
            <span className="dot" onClick={() => moveSlide(1)}></span>
            <span className="dot" onClick={() => moveSlide(2)}></span>
            <span className="dot" onClick={() => moveSlide(3)}></span>
            <span className="dot" onClick={() => moveSlide(4)}></span>
            </div>
        </section>

        <section className="row">
            <div className="col-12 gx-20 d-flex reparticao">
            <p className="titulo">Recomendado</p>
            <p className="subtitulo">Uma seleção feita para você!</p>
            </div>
            <div className="d-flex rolagem">
            <a href="livro-informa.html">
                <div className="livro col-12">
                <img className="capa-livro" src="assets/img/capa-livro.jpg" alt="" />
                <p className="nome-livro">Vermelho Branco e Sangue Azul</p>
                </div>
            </a>
            {/* Repetir o conteúdo do livro, conforme necessário */}
            </div>
        </section>

        
        </main>

        <footer>
        {/* Conteúdo do rodapé */}
        </footer>
    </div>
    )
}

export default Home;