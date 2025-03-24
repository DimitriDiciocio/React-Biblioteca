import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const EditarUsuario: React.FC = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [endereco, setEndereco] = useState('');
    const [senha, setSenha] = useState('');
    const [senhaConfirm, setSenhaConfirm] = useState('');
    const [senhaAntiga, setSenhaAntiga] = useState('');
    const navigate = useNavigate();

    const handleEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
        const updateUser = { nome, email, telefone, endereco, senha, senhaConfirm, senhaAntiga };
        try {
            const response = await fetch(`http://127.0.0.1:5000/editar_usuario/${localStorage.getItem("id")}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateUser),
              });

              const data = await response.json();

              if (response.ok) {
                alert(data.message);
                navigate('/login');
              } else {
                alert(data.message);
              }
            } catch (error) {
              alert('Erro de conexão com o servidor' + error);
            }
        }
        return (
            <div className="pagina-edicao-usuario">
                <header className="container-fluid">
                    <section className="row d-flex cabecalho-claro2">
                        <div className="col-lg-5 col-sm-3 d-flex justify-content-center align-items-center">
                            <img className="logo" src="../../assets/img/logo-branca.png" alt="logo do site" />
                        </div>

                        <div className="col-lg-6 col-sm-6 d-flex justify-content-center align-items-center">
                            <input id="campo-busca" placeholder="O que você quer ler hoje?" />
                        </div>
                        <div className="col-lg-1 col-sm-3 justify-content-center align-items-center">
                            <a href="ver-conta.html">
                                <i className="conta2">account_circle</i>
                            </a>
                        </div>
                    </section>

                    <section className="row cabecalho-escuro2">
                        <div className="col-12 d-flex align-items-center">
                            <div className="d-flex navegacao2 align-items-center">
                                <p>Gênero</p>
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
                    <section className="row align-items-center">
                        <div className="col-2"></div>
                        <div className="col-4">
                            <img className="foto-conta" src="../../assets/img/sorriso.jpg" alt="foto de usuário" />
                        </div>

                        <div className="col-6">
                            <div className="row">
                                <div className="formulario col-12">
                                    <form onSubmit={handleEdicao}>
                                        <p>Nome</p>
                                        <input
                                            className="nome-edita"
                                            type="text"
                                            placeholder="seu nome"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            required
                                        />
                                        <p>Email</p>
                                        <input
                                            className="email-edita"
                                            type="email"
                                            placeholder="seu email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <p>Telefone</p>
                                        <input
                                            className="fone-edita"
                                            type="number"
                                            placeholder="seu telefone"
                                            value={telefone}
                                            onChange={(e) => setTelefone(e.target.value)}
                                            required
                                        />
                                        <p>Endereço</p>
                                        <input
                                            className="endereco-edita"
                                            type="text"
                                            placeholder="seu endereco"
                                            value={endereco}
                                            onChange={(e) => setEndereco(e.target.value)}
                                            required
                                        />
                                        <p>Senha</p>
                                        <input
                                            className="senha-edita"
                                            type="password"
                                            placeholder="sua senha"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                            required
                                        />
                                        <p>Confirma Senha</p>
                                        <input
                                            className="senha-edita-c"
                                            type="password"
                                            placeholder="Confirmar sua senha"
                                            value={senhaConfirm}
                                            onChange={(e) => setSenhaConfirm(e.target.value)}
                                            required
                                        />
                                        <p>Senha Antiga</p>
                                        <input
                                            className="senha-edita-c"
                                            type="password"
                                            placeholder="Digite a senha antiga"
                                            value={senhaAntiga}
                                            onChange={(e) => setSenhaAntiga(e.target.value)}
                                            required
                                        />

                                        <div className="d-flex-bit cc">
                                            <button
                                                type="button"
                                                className="botao-fundo-transparente"
                                                onClick={() => navigate('/')}
                                            >
                                                Cancelar
                                            </button>
                                            <button className="botao-fundo-azul" type="submit">
                                                Salvar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        );
};

export default EditarUsuario;