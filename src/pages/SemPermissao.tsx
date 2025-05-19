import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SemPermissao = () => {
  const navigate = useNavigate();

  return (
    <div className="sem-permissao-body">
      <div className="sem-permissao-box">
        <div className="sem-permissao-icon">
          <ShieldAlert className="icon" />
        </div>
        <h1 className="sem-permissao-title montserrat-alternates-semibold">Acesso negado</h1>
        <p className="sem-permissao-text montserrat-alternates-semibold">
          Você não tem permissão para acessar esta página. 
          Por favor, verifique suas credenciais ou volte para a página anterior.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="sem-permissao-button"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default SemPermissao;
