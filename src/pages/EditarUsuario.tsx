import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
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
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("id_user");

            if (!token || !userId) {
                alert("Usuário não autenticado ou ID de usuário não encontrado.");
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:5000/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setNome(data.nome);
                    setEmail(data.email);
                    setTelefone(data.telefone);
                    setEndereco(data.endereco);
                    
                    if (data.imagem) {
                        const imagemUrl = `http://127.0.0.1:5000/uploads/usuarios/${data.imagem}`;
    
                        fetch(imagemUrl)
                            .then((imgResponse) => {
                                if (imgResponse.ok) {
                                    setImagemPreview(imagemUrl);
                                }
                            })
                            .catch(() => {
                                console.log("Imagem não encontrada");
                            });
                    }
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Erro de conexão com o servidor: ' + error);
            }
        };
    
        fetchUserData();
    }, [navigate]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setImagem(file);
            setImagemPreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });

    const handleEdicao = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('telefone', telefone);
        formData.append('endereco', endereco);

        if (senha || senhaConfirm || senhaAntiga) {
            formData.append('senha', senha);
            formData.append('senhaConfirm', senhaConfirm);
            formData.append('senhaAntiga', senhaAntiga);
        }

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

            if (response.ok) {
                alert(data.message);
                navigate('/');
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
            </header>

            <div className="espaco-vazio"></div>

            <main className="container-fluid">
                <section className="row align-items-center">
                    <div className="col-2"></div>

                    <div className="col-4">
                        <div
                            {...getRootProps()}
                            className="dropzone"
                            style={{
                                border: '2px dashed #ccc',
                                padding: '20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                width: '400px',
                                height: '400px',
                            }}
                        >
                            <input {...getInputProps()} />
                            {imagemPreview ? (
                                <img
                                    src={imagemPreview}
                                    alt="Imagem de perfil"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxHeight: '100%',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <p>Arraste uma imagem ou clique para selecionar</p>
                            )}
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="row">
                            <div className="formulario col-12">
                                <form onSubmit={handleEdicao}>
                                    <p>Nome</p>
                                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                    <p>Email</p>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    <p>Telefone</p>
                                    <input type="number" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                                    <p>Endereço</p>
                                    <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
                                    <p>Senha (opcional)</p>
                                    <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
                                    <p>Confirmar Senha (opcional)</p>
                                    <input type="password" value={senhaConfirm} onChange={(e) => setSenhaConfirm(e.target.value)} />
                                    <p>Senha Antiga (opcional)</p>
                                    <input type="password" value={senhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} />
                                    <div className="d-flex-bit cc">
                                        <button className='botao-fundo-transparente' type="button" onClick={() => navigate('/')}>Cancelar</button>
                                        <button className='botao-fundo-azul' type="submit">Salvar</button>
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
