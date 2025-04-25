export const pagarMulta = async (id_multa: number) => {
    const token = localStorage.getItem("token");    
    const response = await fetch(
        `http://localhost:5000/multa/${id_multa}/atender`,
        {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        }
    );

    if (!response.ok) {
        throw new Error("Erro ao pagar multa.");
    }

    return response.json();
};
