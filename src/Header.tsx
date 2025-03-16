import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    const navigate = useNavigate()
    
    return (
        <header className="container-fluid">
        <section className="row d-flex cabecalho-claro2">
            <div className="col-lg-5 col-sm-3 d-flex justify-content-center align-items-center">
            <img onClick={() => navigate("/")} className="logo" src="../assets/img/logo-branca.png" alt="logo do site" />
            </div>

            <div className="col-lg-6 col-sm-6 d-flex justify-content-center align-items-center">
            <input id="campo-busca" placeholder="O que você quer ler hoje?" className="responsivo-pesquisa"/>
            </div>
            <div className="col-lg-1 col-sm-3 justify-content-center align-items-center">
            <a onClick={() => navigate('/user/editar')} className='text-decoration-none'><i className="conta2">account_circle</i></a>
            <a onClick={() => navigate('/sair')} className='text-decoration-none'><i className="">Sair</i></a>
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
            </div>
        </section>
        </header>
    )
}
export default Header;