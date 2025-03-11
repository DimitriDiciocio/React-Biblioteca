import React, { useState } from 'react';
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
        alert(data.message);
        localStorage.setItem("token", (data.token))
        localStorage.setItem("id_user", JSON.stringify(data.id_user))


        navigate('/'); // Redireciona para a página inicial ou outra rota
      } else {
        alert(data.message);
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
                      <button
                        type="button"
                        className="botao-fundo-transparente text-decoration-none"
                        onClick={() => navigate('/Cadastro')}
                      >
                        Não possuo uma conta
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="col-1"></div>

          <div className='video-bg'>
            <video autoPlay loop muted> <source src='../../assets/video/libris-login.mp4' type='video/mp4'/> </video>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
