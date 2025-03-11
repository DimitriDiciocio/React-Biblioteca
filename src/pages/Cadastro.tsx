import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Cadastro: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState(1);
  const [imagem, setImagem] = useState<File | null>(null); // Novo estado para a imagem
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('telefone', telefone);
    formData.append('endereco', endereco);
    formData.append('senha', senha);
    formData.append('tipo', tipo.toString());

    // Se o usuário escolheu uma imagem, adicionamos ao FormData
    if (imagem) {
      formData.append('imagem', imagem);
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/cadastro', {
        method: 'POST',
        body: formData, // Enviamos FormData, sem JSON.stringify
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro de conexão com o servidor: ' + error);
    }
  };

  return (
    <div className="overflow-hidden colorBack">
      <section className="container">
        <div className="row">
          <div className="col-1"></div>

          {/* Formulário de Cadastro */}
          <div className="col-4 modal-login centraliza">
            <div className="col modal-login2" style={{ backgroundColor: 'white' }}>
              <div className="centraliza">
                <img src="assets/img/logo-azul.png" alt="Logo Libris" />
              </div>

              <div className="centraliza">
                <h1>CADASTRO</h1>
              </div>

              <form className="centraliza" onSubmit={handleCadastro} encType="multipart/form-data">
                <div className="coluna gap-ss">
                  <label htmlFor="name">Nome de Usuário</label>
                  <input
                    type="text"
                    id="name"
                    className="botao-fundo-transparente"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />

                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="botao-fundo-transparente"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <label htmlFor="telefone">Telefone</label>
                  <input
                    type="text"
                    id="telefone"
                    className="botao-fundo-transparente"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                  />

                  <label htmlFor="endereco">Endereço</label>
                  <input
                    type="text"
                    id="endereco"
                    className="botao-fundo-transparente"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    required
                  />

                  <label htmlFor="senha">Senha</label>
                  <input
                    type="password"
                    id="senha"
                    className="botao-fundo-transparente"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />

                  <label htmlFor="tipo">Tipo de usuário</label>
                  <select
                    id="tipo"
                    className="botao-fundo-transparente"
                    value={tipo}
                    onChange={(e) => setTipo(parseInt(e.target.value))}
                    required
                  >
                    <option value={1}>Leitor</option>
                    <option value={2}>Bibliotecário</option>
                    <option value={3}>Administrador</option>
                  </select>

                  {/* Novo campo para upload de imagem */}
                  <label htmlFor="imagem">Imagem de Perfil (opcional)</label>
                  <input
                    type="file"
                    id="imagem"
                    className="botao-fundo-transparente"
                    accept="image/*"
                    onChange={(e) => setImagem(e.target.files ? e.target.files[0] : null)}
                  />

                  <div className="gap-s centraliza">
                    <button type="submit" className="botao-fundo-azul">
                      Cadastrar
                    </button>
                  </div>

                  <div className="gap-s centraliza">
                    <button
                      type="button"
                      className="botao-fundo-transparente text-decoration-none"
                      onClick={() => navigate('/login')}
                    >
                      Possuo uma conta
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="col-1"></div>

          {/* Exibição de Livros */}
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

export default Cadastro;
