import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [temPermissao, setTemPermissao] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const temPermissao = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/tem_permissao", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          setTemPermissao(false);
        }
      } catch (error) {
        console.error("Essa página é restrita:", error);
        setTemPermissao(false);
      }
    };

    temPermissao();
  }, [navigate, token]);

  return (
    <header className="container-fluid">
      <section className="row d-flex cabecalho-claro2">
        <div className="col-lg-5 col-sm-3 d-flex justify-content-center align-items-center">
          <img
            onClick={() => navigate("/")}
            className="logo"
            src="../assets/img/logo-branca.png"
            alt="logo do site"
          />
        </div>

        <div className="col-lg-6 col-sm-6 d-flex justify-content-center align-items-center">
          <input
            id="campo-busca"
            placeholder="O que você quer ler hoje?"
            className="responsivo-pesquisa"
          />
        </div>
        <div className="col-lg-1 col-sm-3 justify-content-center align-items-center">
          <a onClick={() => navigate('/user/editar')} className='text-decoration-none'>
            <i className="conta2">account_circle</i>
          </a>
          <a onClick={() => navigate('/sair')} className='text-decoration-none'>
            <i className="">Sair</i>
          </a>
        </div>
      </section>

      <section className="row cabecalho-escuro2">
        <div className="col-12 d-flex align-items-center">
          <div className="d-flex navegacao2 align-items-center">
            <p>Genero</p>
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

          {temPermissao && (
            <div className="d-flex navegacao2 align-items-center" id="tipo">
              <p onClick={() => navigate('/addLivro')}>Adicionar Livros</p>
            </div>
          )}
          {temPermissao && (
            <div className="d-flex navegacao2 align-items-center" id="tipo">
              <p onClick={() => navigate('/usuarios')}>Usuarios</p>
            </div>
          )}
        </div>
      </section>
    </header>
  );
};

export default Header;
