import React, { useEffect, useState } from "react";
import styles from "../pages/Movimentacoes.module.css";
import { useNavigate } from "react-router-dom";

interface Multa {
    id_multa: number;
    id_usuario: number;
    nome: string;
    email: string;
    id_emprestimo: number;
    valor_base: number;
    valor_acrescimo: number;
    pago: boolean;
    titulos: string;
}

const MultasByUser: React.FC = () => {
    const [multas, setMultas] = useState<Multa[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:5000/usuarios/multas`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Erro na resposta da API");
                }
                return res.json();
            })
            .then((data) => {
                setMultas(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao buscar multas:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className={styles.container}>
            <i
                className="fa-solid fa-arrow-left arrow-back"
                onClick={() => navigate("/home_biblio?page=1")}
            ></i>
            <div className="space-sm"></div>
            <div className={styles.header}>
                <h1 className={styles.title}>Lista de Multas</h1>
            </div>
            <section className={styles["table-container"]}>
                {loading ? (
                    <p className="multas-loading montserrat-alternates">Carregando...</p>
                ) : multas.length === 0 ? (
                    <p className="multas-empty montserrat-alternates">
                        Nenhuma multa encontrada.
                    </p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Valor Base</th>
                                <th>Acréscimo</th>
                                <th>Pago</th>
                                <th>Títulos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {multas.map((multa) => (
                                <tr key={multa.id_multa}>
                                    <td>{multa.nome}</td>
                                    <td>{multa.email}</td>
                                    <td>R$ {multa.valor_base}</td>
                                    <td>R$ {multa.valor_acrescimo}</td>
                                    <td>
                                        <span
                                            className={`${styles.tag} ${
                                                multa.pago ? styles.devolvido : styles.pendente
                                            }`}
                                        >
                                            {multa.pago ? "Sim" : "Não"}
                                        </span>
                                    </td>
                                    <td>
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {String(multa.titulos)
                                                .split(",")
                                                .map((titulo, idx) => (
                                                    <li
                                                        key={idx}
                                                        style={{
                                                            listStyleType: "disc",
                                                            whiteSpace: "normal",
                                                            fontFamily: "inherit",
                                                        }}
                                                    >
                                                        {titulo.trim()}
                                                    </li>
                                                ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default MultasByUser;