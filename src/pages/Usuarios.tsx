import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const Usuarios: React.FC = () => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
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

    const [tipo, setTipo] = useState(user.tipo);
    const [nome, setNome] = useState(user.nome);
    const [email, setEmail] = useState(user.email);
    const [telefone, setTelefone] = useState(user.telefone);
    const [endereco, setEndereco] = useState(user.endereco);
    const [imagem, setImagem] = useState<File | null>(null);

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
                        text: result.error || "Essa página é restrita",
                    });
                }
            } catch (error) {
                console.error("Essa página é restrita:", error);
                navigate(-1);
            }
        };

        temPermissao();
    }, [navigate, token]);

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
            setNome(data.nome);
            setEmail(data.email);
            setTelefone(data.telefone);
            setEndereco(data.endereco);
            setTipo(data.tipo);
        };

        fetchUserData();
    }, [id, token]);

    const imageUrl = `http://127.0.0.1:5000/uploads/usuarios/${user.imagem}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('telefone', telefone);
        formData.append('endereco', endereco);
        formData.append('tipo', tipo.toString());

        if (imagem) {
            formData.append('imagem', imagem);
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/editar_usuario/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire("Sucesso", result.message || "Usuário atualizado com sucesso!", "success");
                navigate("/usuarios");
            } else {
                Swal.fire("Erro", result.message || "Erro ao atualizar usuário", "error");
            }
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
        }
    };

    return (
        <div>
            <h1>Editar Usuário</h1>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
                <img src={imageUrl} alt={user.nome} className="w-48" />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label>Nome</label>
                    <input
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="botao-fundo-transparente"
                    />
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="botao-fundo-transparente"
                    />
                    <label>Telefone</label>
                    <input
                        type="text"
                        placeholder="Telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        required
                        className="botao-fundo-transparente"
                    />
                    <label>Endereço</label>
                    <input
                        type="text"
                        placeholder="Endereço"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        required
                        className="botao-fundo-transparente"
                    />
                    <label>Imagem</label>
                    <input
                        type="file"
                        onChange={(e) => setImagem(e.target.files ? e.target.files[0] : null)}
                        className="botao-fundo-transparente"
                    />
                    <label>Tipo</label>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(Number(e.target.value))}
                        className="botao-fundo-transparente"
                    >
                        <option value="1">Usuário</option>
                        <option value="2">Bibliotecário</option>
                        <option value="3">Administrador</option>
                    </select>
                    <button type="submit" className="botao-fundo-azul">
                        Atualizar Informações e Tipo
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Usuarios;
