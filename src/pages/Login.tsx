import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Login realizado com sucesso!');
        navigate('/'); // Redireciona para a página inicial ou outra rota
      } else {
        alert(data.message || 'Erro ao fazer login');
      }
    } catch (error) {
      alert('Erro ao se conectar com o servidor: ' + String(error));
    }
  };

  return (
    <div className="overflow-hidden colorBack">
      <section className="container">
        <div className="row">
          <div className="col-1"></div>
          <div className="col-4 modal-login centraliza">
            <div className="col modal-login2" style={{ backgroundColor: "white" }}>
              <div className="centraliza">
                <img src="assets/img/logo-azul.png" alt="Logo Libris" />
              </div>
              <div className="centraliza">
                <h1>LOGIN</h1>
              </div>
              <form className="centraliza" onSubmit={handleLogin}>
                <div className="coluna gap-ss">
                  <label htmlFor="email">Email</label>
                  <div className="gap-s">
                    <input
                      type="email"
                      id="email"
                      className="botao-fundo-transparente"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <label htmlFor="senha">Senha</label>
                  <div className="gap-m">
                    <input
                      type="password"
                      id="senha"
                      className="botao-fundo-transparente"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                  </div>

                  <div className="gap-s">
                    <div className="centraliza">
                      <button type="submit" className="botao-fundo-azul">Entrar</button>
                    </div>
                    <div className="centraliza">
                      <Link to='/cadastro' className="botao-fundo-transparente text-decoration-none">Não possuo uma conta</Link>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="col-1"></div>

          <div className="col-6">
            <div className="row">
              <img className="col-4 livro" src="assets/img/o-diario-de-anne-frank.png" alt="O Diário de Anne Frank" />
              <img className="col-4 livro" src="assets/img/o-alquimista.png" alt="O Alquimista" />
              <img className="col-4 livro" src="assets/img/o-codigo-da-vinci.png" alt="O Código Da Vinci" />
            </div>
            <div className="row">
              <img className="col-4 livro" src="assets/img/harry-potter-e-a-crianca-amaldicioada.png" alt="Harry Potter e a Criança Amaldiçoada" />
              <img className="col-4 livro" src="assets/img/dom-casmurro.png" alt="Dom Casmurro" />
              <img className="col-4 livro" src="assets/img/o-pequeno-principe.png" alt="O Pequeno Príncipe" />
            </div>
            <div className="row">
              <img className="col-4 livro" src="assets/img/e-o-vento-levou.png" alt="E o Vento Levou" />
              <img className="col-4 livro" src="assets/img/alem-da-capa.png" alt="Além da Capa" />
              <img className="col-4 livro" src="assets/img/o-senhor-dos-aneis.png" alt="O Senhor dos Anéis" />
            </div>
            <div className="row">
              <img className="col-4 livro" src="assets/img/crepusculo.png" alt="Crepúsculo" />
              <img className="col-4 livro" src="assets/img/percy-jackson-e-os-olimpianos.png" alt="Percy Jackson e os Olimpianos" />
              <img className="col-4 livro" src="assets/img/diario-de-um-banana.png" alt="Diário de um Banana" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
