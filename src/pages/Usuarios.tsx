import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const Usuarios: React.FC = () => {
    const token = localStorage.getItem("token")
    const navigate = useNavigate();

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
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
                }
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                Swal.fire("Erro", result.error || "Erro na verificação do token", "error");
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
        const temPermissao = async () => {
    
        try {
            const response = await fetch("http://127.0.0.1:5000/tem_permissao", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
            });
    
            const result = await response.json();
    
            if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Erro",
                text: result.error || "Essa pagina é restrita",
            });
            }
        } catch (error) {
            console.error("Essa página é restrita:", error);
            navigate(-1)
        }
        };
    
        temPermissao();
    }, [navigate, token]);

    const { id } = useParams();

    const [user, setUser] = useState<Usuario>({
        id: 0,
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        tipo: 0,
        ativo: false,
        imagem: "",
    });

    interface Usuario {
        id: number;
        nome: string;
        email: string;
        telefone: string;
        endereco: string;
        tipo: number;
        ativo: boolean;
        imagem: string;
    }

    const trocarTipo = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/trocar_tipo/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
            });

            const result = await response.json();

            if (!response.ok) {
            Swal.fire("Erro", result.error || "Erro na verificação do token", "error");
            localStorage.removeItem("token");
            }
        } catch (error) {
            console.error("Erro ao verificar token:", error);
        }
    }

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch(`http://127.0.0.1:5000/user/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            
            const data = await response.json();

            setUser(data);
        };
        fetchUserData();
    }, [id, token]);

    const imageUrl = `http://127.0.0.1:5000/uploads/usuarios/${user.imagem}`;

    return (
        <div>


            <h1>Usuário</h1>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
                <img src={imageUrl} alt={user.nome} className="w-50"/>
                <p>ID: {user.id}</p>
                <p>Nome: {user.nome}</p>
                <p>Email: {user.email}</p>
                <p>Telefone: {user.telefone}</p>
                <p>Endereço: {user.endereco}</p>
                <p>Tipo: {user.tipo}</p>
                <p>Ativo: {user.ativo ? "Sim" : "Não"}</p>
                <button onClick={trocarTipo}>Trocar Tipo</button>
            </div>
        </div>
    )
}
export default Usuarios;