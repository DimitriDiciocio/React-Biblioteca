import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sair: React.FC = () => {
    const navigate = useNavigate();
    localStorage.removeItem("id_user");
    localStorage.removeItem("token")
    return (
        <div>
            <h1>Saída concluida com sucesso</h1>
            <button onClick={() => navigate('/login')}>Entrar em outra conta</button>
        </div>
    )
}

export default Sair;