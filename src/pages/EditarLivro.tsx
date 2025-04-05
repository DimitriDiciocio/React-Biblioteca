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
    const tokenIsActive = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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

  useEffect(() => {
    const temPermissao = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/tem_permissao", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: result.error || "Essa pagina é restrita",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Essa página é restrita:", error);
        navigate("/");
      }
    };

    temPermissao();
  }, [navigate, token]);

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
    <div className="pagina-edicao-livro">
      <Header />

      <div className="espaco-vazio"></div>

      <main className="container-fluid">
        <section className="row align-items-center">
          <div className="col-2"></div>
          <div className="col-4">
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
              {imagemPreview ? (
                <img
                  src={imagemPreview}
                  alt="Imagem de capa"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "100%",
                    objectFit: "cover",
                    right: "100px",
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
                  <select
                    className="botao-fundo-transparente w-50"
                    name="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Livro">Livro</option>
                    <option value="Artigo Científico">Artigo Científico</option>
                    <option value="Jornal">Jornal</option>
                    <option value="Quadrinhos">Quadrinhos</option>
                  </select>
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
                  <p>Idiomas</p>
                  <select
                    className="botao-fundo-transparente w-50"
                    name="idiomas"
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
                  <p>Ano publicado</p>
                  <input
                    className="fone-edita"
                    type="number"
                    value={anoPublicado}
                    onChange={(e) => setAnoPublicado(e.target.value)}
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
                  <Tags
                    onTagsChange={handleTagsChange}
                    selectedTags={selectedTags}
                  />

                  <div className="d-flex-bit cc">
                    <button
                      type="button"
                      className="botao-fundo-transparente"
                      onClick={() => navigate("/")}
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
