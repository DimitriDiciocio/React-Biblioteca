import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../index.css";
import { useDropzone } from "react-dropzone";
import Tags from "../components/Tags";
import Swal from "sweetalert2";
import Header from "../components/Header";
import { usePermission } from "../components/usePermission";

const EditarLivro = () => {
  interface Tag {
    id: number;
    nome: string;
  }

  const { id } = useParams();
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [isbn, setIsbn] = useState("");
  const [qtd_disponivel, setQtd_disponivel] = useState("");
  const [descricao, setDescricao] = useState("");
  const [anoPublicado, setAnoPublicado] = useState("");
  const [idiomas, setIdiomas] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagem, setImagem] = useState<File | null>(null);
  const navigate = useNavigate();
  const isAllowed = usePermission(2);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/livros/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
          setIdiomas(data.idiomas);
          setAnoPublicado(data.ano_publicado);
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
          Swal.fire("Erro", data.message, "error");
        }
      } catch (error) {
        Swal.fire(
          "Erro",
          "Erro de conexão com o servidor" + String(error),
          "error"
        );
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  const handleRemoveImage = () => {
    setImagemPreview(null);
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
    formData.append(
      "selectedTags",
      selectedTags.map((tag) => tag.id)
    );
    formData.append("idiomas", idiomas);
    formData.append("ano_publicado", anoPublicado);

    if (imagem) {
      formData.append("imagem", imagem);
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/editar_livro/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Sucesso",
          text: data.message,
        });
        navigate(`/livro/${id}`);
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: data.message || "Erro ao editar livro",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro de conexão com o servidor" + String(error),
      });
    }
  };

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <Header />
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
            <div className="formulario">
              <form onSubmit={handleEdicao} className="w-656">
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Título do Livro:
                  </label>
                  <input
                    className="input montserrat-alternates-semibold"
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
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
                      value={autor}
                      onChange={(e) => setAutor(e.target.value)}
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
                      value={anoPublicado}
                      onChange={(e) => setAnoPublicado(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="montserrat-alternates-semibold">
                      ISBN:
                    </label>
                    <input
                      className="input montserrat-alternates-semibold"
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
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
                      value={idiomas}
                      onChange={(e) => setIdiomas(e.target.value)}
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
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Livro">Livro</option>
                      <option value="Artigo Científico">
                        Artigo Científico
                      </option>
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
                      value={qtd_disponivel}
                      onChange={(e) => setQtd_disponivel(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Tags:
                  </label>
                  <Tags
                    selectedTags={selectedTags}
                    onTagsChange={handleTagsChange}
                  />
                </div>

                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Descrição:
                  </label>
                  <textarea
                    className="input montserrat-alternates-semibold"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="d-flex g-sm m-top">
                  <button
                    type="submit"
                    className="salvar montserrat-alternates-semibold"
                  >
                    <span>Salvar</span>
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
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditarLivro;
