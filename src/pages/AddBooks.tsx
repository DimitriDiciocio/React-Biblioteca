import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import '../index.css';
import Swal from "sweetalert2";
import Tags from "../Tags";
import Header from "../Header"

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

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
            icon: "error",
            title: "Erro",
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

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Exibir a imagem escolhida
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const newBook = {
      ...formData,
      selectedTags: selectedTags.map((tag) => tag.id),
    };
  
    const requestBody = new FormData();
  
    // Adicionando os dados do livro
    Object.keys(newBook).forEach((key) => {
      requestBody.append(key, newBook[key as keyof typeof newBook]);
    });
  
    if (image) {
      requestBody.append("imagem", image);
    }
  
    try {
      const response = await fetch("http://127.0.0.1:5000/adicionar_livros", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: requestBody,
      });
  
      const result = await response.json();
      Swal.fire({
        icon: response.ok ? "success" : "error",
        title: response.ok ? "Sucesso" : "Erro",
        text: result.message || result.error,
      });
  
      // Resetar os campos do formulário após o sucesso
      if (response.ok) {
        setFormData({
          titulo: "",
          autor: "",
          categoria: "",
          isbn: "",
          qtd_disponivel: "",
          descricao: "",
          idiomas: "",
          ano_publicado: "",
        });
        setImage(null);
        setImagePreview(null);
        setSelectedTags([]);
      }
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
    }
  };

  return (
    <div className="pagina-livro-informa">
      <Header/>

      <div className="espaco-vazio"></div>

      <main>
        <section className="d-flex-eve">
          {/* Dropzone para imagem de capa */}
          <div className="col-1">
            <div
              {...getRootProps()}
              className="dropzone"
              style={{
                border: "2px dashed #ccc",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "10px",
                width: "300px",
                height: "400px",
              }}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Imagem de capa"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <p>Arraste uma imagem ou clique para selecionar</p>
              )}
            </div>
          </div>

          {/* Formulário de adição de livro */}
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
                    className="botao-fundo-transparente w-75"
                    type="number"
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
                    <p className="margin-b-zero">Quantidade disponível</p>
                  </label>
                  <input
                    className="botao-fundo-transparente w-75"
                    type="number"
                    name="qtd_disponivel"
                    value={formData.qtd_disponivel}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex">
                <div className="avaliacao">
                  <label htmlFor="categoria">
                    <p className="margin-b-zero">Categoria</p>
                  </label>
                  <input
                    className="botao-fundo-transparente w-100"
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="espacinho"></div>
                <div className="avaliacao">
                  <label>
                    <p className="margin-b-zero">Idiomas</p>
                  </label>
                  <input
                    className="botao-fundo-transparente w-75 "
                    type="text"
                    name="idiomas"
                    value={formData.idiomas}
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
                  <div style={{ width: '470px', maxWidth: '100%', height: '100%', padding: '0' }}>
                  <Tags selectedTags={selectedTags} onTagsChange={handleTagsChange} />
                  </div>
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
                <button type="button" onClick={() => navigate('/')} className="agendamento botao-fundo-transparente pointer">
                  Cancelar
                </button>
                <button type="submit" className="emprestimo botao-fundo-azul pointer">
                  Confirmar
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
};

export default AddBooks;
