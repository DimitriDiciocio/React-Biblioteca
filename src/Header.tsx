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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = (document.getElementById('campo-busca') as HTMLInputElement)?.value;
                const filters = Array.from(document.querySelectorAll('.filter-checkbox:checked')).map(
                  (checkbox) => (checkbox as HTMLInputElement).value
                );
                navigate(`/pesquisa/${query}?filters=${filters.join(',')}`);
              }}
            >
              <div className="d-flex justify-content-center align-items-center">
                <input
                  id="campo-busca"
                  required
                  placeholder="O que você quer ler hoje?"
                  className="responsivo-pesquisa"
                />
                <div className="filter-options">
                  <i className="conta2">arrow_drop_down</i>
                  <div className="filter-options-content">
                    <label>
                      <input type="checkbox" className="filter-checkbox" value="tags" />
                      Tags
                    </label>
                    <label>
                      <input type="checkbox" className="filter-checkbox" value="isbn" />
                      ISBN
                    </label>
                    <label>
                      <input type="checkbox" className="filter-checkbox" value="autor" />
                      Autor
                    </label>
                    <label>
                      <input type="checkbox" className="filter-checkbox" value="categoria" />
                      Categoria
                    </label>
                  </div>
                </div>
              </div>
            </form>
        </div>
        <div className="col-lg-1 col-sm-3 justify-content-center align-items-center">
          <a onClick={() => navigate('/user/editar')} className='text-decoration-none'>
            <i className="conta2">account_circle</i>
          </a>
          <a onClick={() => navigate('/sair')} className='text-decoration-none'>
            <i className="conta2">logout</i>
          </a>
        </div>
      </section>

      <section className="row cabecalho-escuro2">
        <div className="col-12 d-flex align-items-center">
          <div className="d-flex navegacao2 align-items-center">
            <p>Genero</p>
            <i>arrow_drop_down</i>
          </div>
          <div className="d-flex navegacao2 align-items-center" onClick={() => navigate('/historico')}>
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
              <p onClick={() => navigate('/usuarios')}>Usuários</p>
            </div>
          )}
          {temPermissao && (
            <div className="d-flex navegacao2 align-items-center" id="tipo">
              <p onClick={() => navigate('/relatorios')}>Relatórios</p>
            </div>
          )}
          {temPermissao && (
            <div className="d-flex navegacao2 align-items-center" id="tipo">
              <p onClick={() => navigate('/cadastrar_usuario')}>Cadastrar Usuário</p>
            </div>
          )}
        </div>
      </section>
    </header>
  );
};

export default Header;