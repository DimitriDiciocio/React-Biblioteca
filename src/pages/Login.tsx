import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false); // Estado para controlar a visibilidade da senha
  const navigate = useNavigate();

  const veSenha = () => {
    setMostrarSenha(!mostrarSenha); // Alterna entre mostrar e ocultar a senha
  };

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('id_user', JSON.stringify(data.id_user));

        await Swal.fire({
          title: 'Login realizado!',
          text: data.message,
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ir para o início',
        });
        if (data.tipo == 1 || data.tipo == 2) {
          navigate('/');
        }
        else if (data.tipo == 3) {
          navigate('/usuarios');
        }
      } else {
        await Swal.fire({
          title: 'Erro no login',
          text: data.message,
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'Erro de conexão!',
        text: 'Não foi possível se conectar ao servidor.' + String(error),
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="overflow-hidden colorBack">
      <section className="container">
        <div className="row row-centraliza">
          <div className="col-1"></div>
          <div className="col-4 modal-login centraliza">
            <div className="col modal-login2" style={{ backgroundColor: 'white' }}>
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
                      required
                    />
                  </div>

                  <label htmlFor="senha">Senha</label>
                  <div className="">
                    <input
                      type={mostrarSenha ? 'text' : 'password'} // Alterna entre 'password' e 'text'
                      id="senha"
                      className="botao-fundo-transparente"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                    <p onClick={veSenha} style={{ cursor: 'pointer' }}>
                      {mostrarSenha ? 'Esconder' : 'Mostrar'} senha
                    </p>
                  </div>

                  <div className="gap-s mg-top-s">
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

          <div className="video-bg">
            <video autoPlay loop muted>
              <source src="../../assets/video/libris-login.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
