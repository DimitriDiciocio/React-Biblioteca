import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../index.css';
import { useDropzone } from 'react-dropzone';
import Tags from '../Tags';
import Swal from 'sweetalert2';

const EditarLivro = () => {
    interface Tag {
        id: number;
        nome: string;
    }

    const { id } = useParams();
    const [titulo, setTitulo] = useState('');
    const [autor, setAutor] = useState('');
    const [categoria, setCategoria] = useState('');
    const [isbn, setIsbn] = useState('');
    const [qtd_disponivel, setQtd_disponivel] = useState('');
    const [descricao, setDescricao] = useState('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [imagem, setImagem] = useState<File | null>(null);
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
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: result.error || "Erro na verificação do token",
                    });
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

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/livros/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setTitulo(data.titulo);
                    setAutor(data.autor);
                    setCategoria(data.categoria);
                    setIsbn(data.isbn);
                    setQtd_disponivel(data.qtd_disponivel);
                    setDescricao(data.descricao);
                    setSelectedTags(data.selectedTags);
                    console.log(data);

                    if (data.imagem) {
                        const imagemUrl = `http://127.0.0.1:5000/uploads/livros/${data.imagem}`;

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
                    Swal.fire('Erro', data.message, 'error');
                }
            } catch (error) {
                Swal.fire('Erro', 'Erro de conexão com o servidor' + String(error), 'error');
            }
        };

        fetchBookData();
    }, [navigate, id, token]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setImagem(file);
            setImagemPreview(URL.createObjectURL(file));
        }
    }, []);

    useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });

    const handleTagsChange = (tags: Tag[]) => {
        setSelectedTags(tags);
    };

    const handleEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("autor", autor);
        formData.append("categoria", categoria);
        formData.append("isbn", isbn);
        formData.append("qtd_disponivel", qtd_disponivel);
        formData.append("descricao", descricao);
        formData.append("selectedTags", selectedTags.map((tag) => tag.id));
        formData.append("idiomas", "Português");
        formData.append("ano_publicado", "2021");
    
        if (imagem) {
            formData.append("imagem", imagem);
        }


        try {
            const response = await fetch(`http://127.0.0.1:5000/editar_livro/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
    
            const data = await response.json();
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso',
                    text: data.message,
                });
                navigate(`/livro/${id}`);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: data.message || 'Erro ao editar livro',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro de conexão com o servidor' + String(error),
            });
        }
    };

    return (
        <div className="pagina-edicao-livro">
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
                        <img className="foto-conta" src={imagemPreview || "../../assets/img/sorriso.jpg"} alt="Imagem do livro" />
                    </div>

                    <div className="col-6">
                        <div className="row">
                            <div className="formulario col-12">
                                <form onSubmit={handleEdicao}>
                                    <p>Título</p>
                                    <input
                                        className="nome-edita"
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        required
                                    />
                                    <p>Autor</p>
                                    <input
                                        className="email-edita"
                                        type="text"
                                        value={autor}
                                        onChange={(e) => setAutor(e.target.value)}
                                        required
                                    />
                                    <p>Categoria</p>
                                    <input
                                        className="fone-edita"
                                        type="text"
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                        required
                                    />
                                    <p>ISBN</p>
                                    <input
                                        className="fone-edita"
                                        type="text"
                                        value={isbn}
                                        onChange={(e) => setIsbn(e.target.value)}
                                        required
                                    />
                                    <p>Quantidade disponível</p>
                                    <input
                                        className="fone-edita"
                                        type="number"
                                        value={qtd_disponivel}
                                        onChange={(e) => setQtd_disponivel(e.target.value)}
                                        required
                                    />
                                    <p>Descrição</p>
                                    <input
                                        className="fone-edita"
                                        type="text"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        required
                                    />
                                    <p>Tags</p>
                                    <Tags onTagsChange={handleTagsChange} selectedTags={selectedTags} />

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

export default EditarLivro;
