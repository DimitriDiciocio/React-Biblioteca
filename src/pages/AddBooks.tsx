import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import "../index.css";
import Swal from "sweetalert2";
import Tags from "../components/Tags";
import Header from "../components/Header";
import { usePermission } from "../components/usePermission";

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
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const isAllowed = usePermission(2);

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      setImagemPreview(URL.createObjectURL(file)); // Exibir a imagem escolhida
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
        setImagemPreview(null);
        setSelectedTags([]);
      }
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
    }
  };

  const handleRemoveImage = () => {
    setImagemPreview(null);
    setImage(null);
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <main className="background-blue">
        <div className="space-sm-y"></div>
        <section className="d-flex center-x size-medium g-30">
          <div>
            <div
              {...getRootProps()}
              className="border-book4 dropzone"
              id="dropzone"
            >
              <input {...getInputProps()} />
              {imagemPreview ? (
                <>
                  <img src={imagemPreview} alt="Imagem de capa" />
                  <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveImage();
                  }}
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    cursor: "pointer",
                  }}
                  >
                    X
                  </button>
                </>
              ) : (
                <div className="dz-message">
                  <p>
                    Arraste e solte a capa do livro aqui ou clique para
                    selecionar
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="w-656">
              <div className="form-group">
                <label className="montserrat-alternates-semibold">
                  Título do Livro:
                </label>
                <input
                  className="input montserrat-alternates-semibold"
                  type="text"
                  name="titulo"
                  placeholder="Título"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="d-flex g-20">
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Autor:
                  </label>
                  <input
                    className="input montserrat-alternates-semibold"
                    type="text"
                    name="autor"
                    placeholder="Autor"
                    value={formData.autor}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Ano Publicado:
                  </label>
                  <input
                    className="input montserrat-alternates-semibold"
                    type="number"
                    name="ano_publicado"
                    placeholder="Ano"
                    value={formData.ano_publicado}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    ISBN:
                  </label>
                  <input
                    className="input montserrat-alternates-semibold"
                    type="number"
                    name="isbn"
                    placeholder="ISBN"
                    value={formData.isbn}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="d-flex g-20 w-192">
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Idioma:
                  </label>
                  <select
                    className="input montserrat-alternates-semibold"
                    name="idiomas"
                    value={formData.idiomas}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Idioma</option>
                    <option value="Português">Português</option>
                    <option value="Inglês">Inglês</option>
                    <option value="Espanhol">Espanhol</option>
                    <option value="Francês">Francês</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Categoria:
                  </label>
                  <select
                    className="input montserrat-alternates-semibold"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Livro">Livro</option>
                    <option value="Artigo Científico">Artigo Científico</option>
                    <option value="Jornal">Jornal</option>
                    <option value="Quadrinhos">Quadrinhos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Estoque:
                  </label>
                  <input
                    className="input montserrat-alternates-semibold"
                    type="number"
                    name="qtd_disponivel"
                    placeholder="Quantidade"
                    value={formData.qtd_disponivel}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="montserrat-alternates-semibold">Tags:</label>
                <div
                  style={{
                    width: "913px",
                    maxWidth: "100%",
                    height: "50px",
                    padding: "0",
                  }}
                >
                  <Tags
                    selectedTags={selectedTags}
                    onTagsChange={handleTagsChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="montserrat-alternates-semibold">
                  Descrição:
                </label>
                <textarea
                  className="input montserrat-alternates-semibold"
                  name="descricao"
                  placeholder="Descrição do livro"
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="d-flex g-sm m-top">
                <button
                  type="submit"
                  className="salvar montserrat-alternates-semibold"
                >
                  <span>Adicionar</span>
                </button>
                <button
                  type="reset"
                  className="salvar cancelar montserrat-alternates-semibold"
                  onClick={() => navigate("/")}
                >
                  <span>Cancelar</span>
                </button>
              </div>
            </form>
          </div>
        </section>
        <div className="fake-header"></div>
      </main>
    </div>
  );
};

export default AddBooks;
