import { useNavigate } from "react-router-dom";
import Header from "../Header";

const HomeBiblio: React.FC = () => {
    const navigate = useNavigate()
    return (
        <div className="container">
            <Header/>
            <div className="espaco-vazio"></div>
            
            <div className="grid-home-biblio">
                <button className="botao-home-biblio" onClick={() => navigate("/usuarios")}>
                    <span className="titulo-botao-home-biblio">Visualizar Usuários</span>
                    <span className="descricao-botao-home-biblio">Veja a lista de usuários cadastrados.</span>
                </button>
                <button className="botao-home-biblio" onClick={() => navigate("/cadastrar_usuario")}>
                    <span className="titulo-botao-home-biblio">Cadastrar Usuários</span>
                    <span className="descricao-botao-home-biblio">Adicione novos usuários ao sistema.</span>
                </button>
                <button className="botao-home-biblio" onClick={() => navigate("/addLivro")}>
                    <span className="titulo-botao-home-biblio">Adicionar Livros</span>
                    <span className="descricao-botao-home-biblio">Inclua novos livros no acervo.</span>
                </button>
                <button className="botao-home-biblio" onClick={() => navigate("/relatorios")}>
                    <span className="titulo-botao-home-biblio">Gerar Relatório</span>
                    <span className="descricao-botao-home-biblio">Crie relatórios sobre o uso da biblioteca.</span>
                </button>
                <button className="botao-home-biblio" onClick={() => navigate("/livros")}>
                    <span className="titulo-botao-home-biblio">Visualizar Livros</span>
                    <span className="descricao-botao-home-biblio">Veja a lista de livros cadastrados.</span>
                </button>
            </div>
        </div>
    )
}

export default HomeBiblio;
