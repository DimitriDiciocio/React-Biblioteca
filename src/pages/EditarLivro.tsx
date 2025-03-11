import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import Tags from '../Tags';

const EditarLivro: React.FC = () => {

    interface Tag {
        id: number;
        nome: string;
      }

    const [titulo, setTitulo] = useState('');
    const [autor, setAutor] = useState('');
    const [categoria, setCategoria] = useState('');
    const [isbn, setIsbn] = useState('');
    const [qtd_disponivel, setQtd_disponivel] = useState('');
    const [descricao, setDescricao] = useState('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const navigate = useNavigate();

    const handleTagsChange = (tags: Tag[]) => {
        setSelectedTags(tags); // Atualiza o estado com as tags selecionadas
      };

    const handleEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
        const updateBook = {titulo, autor, categoria, isbn, qtd_disponivel, descricao, selectedTags,};
        try {
            const response = await fetch(`http://127.0.0.1:5000/editar_livro/${localStorage.getItem("id_livro")}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateBook),
              });

              const data = await response.json();

              if (response.ok) {
                alert(data.message);
                navigate(`/livro/${localStorage.getItem("id_livro")}`);
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
                                        <p>Titulo</p>
                                        <input
                                            className="nome-edita"
                                            type="text"
                                            placeholder="titulo do livro"
                                            value={titulo}
                                            onChange={(e) => setTitulo(e.target.value)}
                                            required
                                        />
                                        <p>Autor</p>
                                        <input
                                            className="email-edita"
                                            type="text"
                                            placeholder="seu email"
                                            value={autor}
                                            onChange={(e) => setAutor(e.target.value)}
                                            required
                                        />
                                        <p>Categoria</p>
                                        <input
                                            className="fone-edita"
                                            type="text"
                                            placeholder="categoria"
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                            required
                                        />
                                        <p>ISBN</p>
                                        <input
                                            className="fone-edita"
                                            type="text"
                                            placeholder="isbn"
                                            value={isbn}
                                            onChange={(e) => setIsbn(e.target.value)}
                                            required
                                        />
                                        <p>Quantidade disponível</p>
                                        <input
                                            className="fone-edita"
                                            type="number"
                                            placeholder="quantidade disponível"
                                            value={qtd_disponivel}
                                            onChange={(e) => setQtd_disponivel(e.target.value)}
                                            required
                                        />
                                        <p>Descrição</p>
                                        <input
                                            className="fone-edita"
                                            type="text"
                                            placeholder="descrição"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            required
                                        />
                                        <p>Tags</p>
                                        <Tags onTagsChange={handleTagsChange} /> {/* Passa a função para o componente Tags */}
                                        

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