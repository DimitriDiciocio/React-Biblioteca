import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../index.css';
import Tags from "../Tags";
import { useNavigate } from 'react-router-dom';

interface Tag {
  id: number;
  nome: string;
}

const AddBooks: React.FC = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    categoria: "",
    isbn: "",
    qtd_disponivel: "",
    descricao: "",
    idiomas: "",
    ano_publicado: "",
  });

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login'); // Redireciona para a página de login se não houver token
        }

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [image, setImage] = useState<File | null>(null);

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Criando o objeto para enviar com os dados do livro
    const newBook = {
      ...formData,
      selectedTags: selectedTags.map(tag => tag.id), // Extrai os ids das tags selecionadas
    };

    // Criando o formulário FormData manualmente para enviar a imagem e outros dados
    const requestBody = new FormData();
    
    // Adicionando os dados do livro (exceto a imagem)
    Object.keys(newBook).forEach(key => {
      requestBody.append(key, newBook[key as keyof typeof newBook]);
    });

    // Adicionando a imagem (se houver)
    if (image) {
      requestBody.append("imagem", image);
    }

    try {
      const response = await fetch("/adicionar_livros", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: requestBody, // Envia como FormData
      });

      const result = await response.json();
      alert(result.message || result.error);
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
    }
  };

  return (
    <body className="pagina-livro-informa">
      <header className="container-fluid">
        <section className="row d-flex cabecalho-claro2">
          <div className="col-lg-5 col-sm-3 d-flex justify-content-center align-items-center">
            <Link to="/">
              <img className="logo" src="assets/img/logo-branca.png" alt="logo do site" />
            </Link>
          </div>

          <div className="col-lg-6 col-sm-6 d-flex justify-content-center align-items-center">
            <input id="campo-busca" placeholder="O que você quer ler hoje?" />
          </div>
          <div className="col-lg-1 col-sm-3 justify-content-center align-items-center">
            <Link to="/ver-conta" className="text-decoration-none">
              <i className="conta2">account_circle</i>
            </Link>
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

      <main>
        <section className="d-flex-eve">
          <div>
            <form action="/upload" className="dropzone" id="my-dropzone">
              <input type="file" onChange={handleFileChange} accept="image/*" />
            </form>
          </div>

          <section className="estreita">
            <form onSubmit={handleSubmit}>
              <div className="d-flex">
                <div className="avaliacao">
                  <label htmlFor="titulo">
                    <p className="margin-b-zero">Título</p>
                  </label>
                  <input
                    className="botao-fundo-transparente w-175"
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex estreita">
                <div className="avaliacao">
                  <label htmlFor="autor">
                    <p className="margin-b-zero">Autor</p>
                  </label>
                  <input
                    className="botao-fundo-transparente"
                    type="text"
                    name="autor"
                    value={formData.autor}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="espacinho"></div>
                <div className="avaliacao">
                  <label htmlFor="ano_publicado">
                    <p className="margin-b-zero">Ano publicado</p>
                  </label>
                  <input
                    className="botao-fundo-transparente"
                    type="date"
                    name="ano_publicado"
                    value={formData.ano_publicado}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex estreita">
                <div className="avaliacao">
                  <label htmlFor="isbn">
                    <p className="margin-b-zero">ISBN</p>
                  </label>
                  <input
                    className="botao-fundo-transparente"
                    type="number"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="espacinho"></div>
                <div className="avaliacao">
                  <label htmlFor="categoria">
                    <p className="margin-b-zero">Categoria</p>
                  </label>
                  <input
                    className="botao-fundo-transparente w-75"
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex">
                <div className="avaliacao">
                  <label>
                    <p className="margin-b-zero">Tags</p>
                  </label>
                  <Tags onTagsChange={handleTagsChange} />
                </div>
                <div className="espacinho"></div>
                <div className="avaliacao">
                  <label htmlFor="idiomas">
                    <p className="margin-b-zero">Idiomas</p>
                  </label>
                  <input
                    className="botao-fundo-transparente w-75"
                    type="text"
                    name="idiomas"
                    value={formData.idiomas}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex estreita">
                <div className="avaliacao">
                  <label htmlFor="descricao">
                    <p className="margin-b-zero">Descrição</p>
                  </label>
                  <textarea
                    className="maior"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="botoes2">
                <button type="submit" className="agendamento botao-fundo-transparente pointer">Confirmar</button>
                <button type="button" className="emprestimo botao-fundo-azul pointer">Cancelar</button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </body>
  );
};

export default AddBooks;
