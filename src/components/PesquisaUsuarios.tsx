import { useEffect, useState } from "react"

const PesquisaUsuarios: React.FC = () => {
    const token = localStorage.getItem("token");
    const [pesquisa, setPesquisa] = useState('');
    
    useEffect(() => {
        async function fetchUsers() {
            const response = await fetch('http://127.0.0.1:5000/usuarios/pesquisa', { 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ pesquisa: pesquisa })
            });
            const data = await response.json();
            console.log(data);
        }
        if (pesquisa) {
            fetchUsers();
        }
    }, [pesquisa, token]);

    return (
        <div>
            <input 
                type="text" 
                placeholder="Pesquisar usuários" 
                onChange={(e) => setPesquisa(e.target.value)}
            />
            <button onClick={() => setPesquisa(pesquisa)}>Pesquisar</button>
        </div>
    )
}
export default PesquisaUsuarios;