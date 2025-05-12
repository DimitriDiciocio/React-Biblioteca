import React, { useEffect, useState } from "react";

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

const MultasByUser:React.FC = () => {
    const [multas, setMultas] = useState<Multa[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token")

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

    return(
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4 montserrat-alternates-semibold">Lista de Multas</h1>
            {loading ? (
                <p className="montserrat-alternates">Carregando...</p>
            ) : multas.length === 0 ? (
                <p className="montserrat-alternates-semibold">Nenhuma multa encontrada.</p>
            ) : (
                <div className="overflow-auto max-w-full">
                <table className="w-full table-auto border border-gray-300 min-w-[600px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 montserrat-alternates-semibold">Nome</th>
                      <th className="border px-4 py-2 montserrat-alternates-semibold">Email</th>
                      <th className="border px-4 py-2 montserrat-alternates-semibold">Valor Base</th>
                      <th className="border px-4 py-2 montserrat-alternates-semibold">Acréscimo</th>
                      <th className="border px-4 py-2 montserrat-alternates-semibold">Pago</th>
                      <th className="border px-4 py-2 montserrat-alternates-semibold">Títulos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multas.map((multa) => (
                      <tr key={multa.id_multa}>
                        <td className="border px-4 py-2 montserrat-alternates">{multa.nome}</td>
                        <td className="border px-4 py-2 montserrat-alternates">{multa.email}</td>
                        <td className="border px-4 py-2 montserrat-alternates">R$ {multa.valor_base}</td>
                        <td className="border px-4 py-2 montserrat-alternates">R$ {multa.valor_acrescimo}</td>
                        <td className="border px-4 py-2 montserrat-alternates">{multa.pago ? "Sim" : "Não"}</td>
                        <td className="border px-4 py-2 montserrat-alternates">{multa.titulos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
    );
};
export default MultasByUser