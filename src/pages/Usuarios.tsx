import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const Usuarios: React.FC = () => {
    const token = localStorage.getItem("token")
    const { id } = useParams();
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
    return (
        <div>
            <button onClick={trocarTipo}>Trocar Tipo</button>
        </div>
    )
}
export default Usuarios;