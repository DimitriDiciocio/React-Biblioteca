import React, { useState, useEffect } from 'react';
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
    const [imagem, setImagem] = useState<File | null>(null);
    const navigate = useNavigate();

    // Verifica se o usuário está autenticado
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("id_user");

            if (!token || !userId) {
                alert("Usuário não autenticado ou ID de usuário não encontrado.");
                navigate('/login');
                return;
            }

            console.log(`URL: http://127.0.0.1:5000/user/${userId}`);
            console.log(`Token: ${token}`);

            try {
                const response = await fetch(`http://127.0.0.1:5000/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                const data = await response.json();
                console.log(data);

                if (response.ok) {
                    setNome(data.nome);
                    setEmail(data.email);
                    setTelefone(data.telefone);
                    setEndereco(data.endereco);
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Erro de conexão com o servidor: ' + error);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImagem(e.target.files[0]);
        }
    };

    const handleEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
        const updateUser = { nome, email, telefone, endereco, senha, senhaConfirm, senhaAntiga };

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('telefone', telefone);
        formData.append('endereco', endereco);
        formData.append('senha', senha);
        formData.append('senhaConfirm', senhaConfirm);
        formData.append('senhaAntiga', senhaAntiga);
        if (imagem) {
            formData.append('imagem', imagem);
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/editar_usuario`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: formData,
            });

            const data = await response.json();
            console.log(data);

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
        <div className="pagina-edicao-usuario">
            <header className="container-fluid">
                {/* Cabeçalho */}
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
                                    <input className="nome-edita" type="text" placeholder="seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                    <p>Email</p>
                                    <input className="email-edita" type="email" placeholder="seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    <p>Telefone</p>
                                    <input className="fone-edita" type="number" placeholder="seu telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                                    <p>Endereço</p>
                                    <input className="endereco-edita" type="text" placeholder="seu endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
                                    <p>Senha</p>
                                    <input className="senha-edita" type="password" placeholder="sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                                    <p>Confirma Senha</p>
                                    <input className="senha-edita-c" type="password" placeholder="Confirmar sua senha" value={senhaConfirm} onChange={(e) => setSenhaConfirm(e.target.value)} required />
                                    <p>Senha Antiga</p>
                                    <input className="senha-edita-c" type="password" placeholder="Digite a senha antiga" value={senhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} required />

                                    {/* Campo para upload de imagem */}
                                    <p>Imagem de Perfil</p>
                                    <input type="file" accept="image/*" onChange={handleImagemChange} />

                                    <div className="d-flex-bit cc">
                                        <button type="button" className="botao-fundo-transparente" onClick={() => navigate('/')}>
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
