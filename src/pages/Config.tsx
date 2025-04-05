import React, { useCallback, useState, useEffect } from "react";
import Header from "../components/Header";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../components/usePermission";
import EditarUsuario from "../components/EditarUsuario";
import TrocarSenha from "../components/TrocarSenha";
import Carrinho from "../components/Carrinho";
import PuxarHistorico from "../components/PuxarHistorico";
import Swal from "sweetalert2";

const Config: React.FC = () => {
  const [nome, setNome] = useState("");
  const [imagemPreview, setImagemPreview] = useState("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const isAllowed = usePermission(1);
  const token = localStorage.getItem("token");

  const switchPage = (page: number) => {
    setPage(page);
    document.querySelectorAll(".nav-lateral li a").forEach((li, index) => {
      li.classList.toggle("active", index === page - 1);
    });
    document.querySelectorAll(".page").forEach((pageElement, index) => {
      pageElement.classList.toggle("active", index === page - 1);
    });
  };

  useEffect(() => {
    switchPage(1); // Set default page to "Início"
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImagemPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setNome(data.nome);
          setImagemPreview(data.imagem);

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
          Swal.fire({
            title: "Erro ao buscar dados do usuário",
            text: data.message,
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Erro de conexão com o servidor",
          text: String(error),
          icon: "error",
        });
      }
    };

    fetchUserData();
  }, [navigate, token]);

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  return (
    <div>
      <Header />
      <main className="background-blue">
        <aside className="sidebar">
          <nav className="nav-lateral">
            <ul>
              <li onClick={() => switchPage(1)}>
                <a className="active">Início</a>
              </li>
              <li onClick={() => switchPage(2)}>
                <a>Informações Pessoais</a>
              </li>
              <li onClick={() => switchPage(3)}>
                <a>Segurança</a>
              </li>
              <li onClick={() => switchPage(4)}>
                <a>Gerenciar Livros</a>
              </li>
              <li onClick={() => switchPage(5)}>
                <a>Minha Lista</a>
              </li>
              <li onClick={() => switchPage(6)}>
                <a>Histórico</a>
              </li>
              <div className="space-xxbig-y"></div>
              <li className="highlight" onClick={() => navigate("/sair")}>
                <a>Sair</a>
              </li>
            </ul>
          </nav>
        </aside>
        <section className="content montserrat-alternates-semibold">
          <div className="page active">
            <img
              src={imagemPreview}
              alt="Foto de perfil"
              className="foto-perfil"
            />
            <p>Olá! {nome}</p>
            <form>
              <div className="p-relative">
                <input required type="text" placeholder="Pesquisar..." />
              </div>
            </form>
          </div>
          <div className="page">
            <p>Informações Pessoais</p>
            <p>Informações sobre você e suas preferências</p>
            <EditarUsuario />
          </div>
          <div className="page">
            <TrocarSenha />
          </div>
          <div className="page">
            <p>Gerenciar Livros</p>
            <Carrinho />
          </div>
          <div className="page">
            <p>Minha Lista</p>
          </div>
          <div className="page">
            <p>Histórico</p>
            <PuxarHistorico />
          </div>
        </section>
      </main>
    </div>
  );
};
export default Config;
