import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MostrarLivros from './MostrarLivros';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import Header from '../Header';

const Home: React.FC = () => {
  
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
    
    useEffect(() => {
      const tokenIsActive = async () => {
        if (!token) {
          navigate("/login");
          return;
        }
  
        try {
          const response = await fetch("http://127.0.0.1:5000/token", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
  
          const result = await response.json();
  
          if (!response.ok) {
            Swal.fire("Erro", result.error || "Erro na verificação do token", "error");
            localStorage.removeItem("token");
            navigate("/login");
          }
        } catch (error) {
          console.error("Erro ao verificar token:", error);
          navigate("/login");
        }
      };
  
      tokenIsActive();
    }, [navigate, token]);


  const moveSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div>
        <Header/>

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
            <MostrarLivros/>
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