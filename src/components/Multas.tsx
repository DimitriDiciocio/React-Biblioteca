import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { pagarMulta } from "../services/multaService";

interface Props {
  isVisible: boolean;
}

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

const Multas: React.FC<Props> = ({ isVisible }) => {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchMultas = useCallback(async () => {
    if (!isVisible) return; // Stop if not visible
    
    try {
      const response = await fetch(`http://localhost:5000/multas/${page}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setHasMore(false);
        return;
      }

      setMultas(prev => page === 1 ? data : [...prev, ...data]);
      
      if (data.length < 8) {
        setHasMore(false);
      }

    } catch (err) {
      console.error("Erro ao buscar multas:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, token, isVisible]); // Add isVisible to dependencies

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 100;

    if (scrollPosition >= threshold) {
      // Prevent multiple triggers
      if (!loading) {
        setPage(prev => prev + 1);
      }
    }
  }, [loading, hasMore]);

  // Reset pagination when becoming visible again
  useEffect(() => {
    if (isVisible) {
      setPage(1);
      setHasMore(true);
    }
  }, [isVisible]);

  // Only fetch when visible
  useEffect(() => {
    if (isVisible) {
      fetchMultas();
    }
  }, [page, isVisible, fetchMultas]);

  // Only attach scroll listener when visible
  useEffect(() => {
    if (!isVisible) return;
    
    const scrollListener = () => {
      if (!loading) {
        handleScroll();
      }
    };

    window.addEventListener("scroll", scrollListener);
    return () => window.removeEventListener("scroll", scrollListener);
  }, [isVisible, loading, handleScroll]);

  const handlePagarMulta = async (id_multa: number) => {
    try {
      await pagarMulta(id_multa);
      setMultas((prevMultas) =>
        prevMultas.map((multa) =>
          multa.id_multa === id_multa ? { ...multa, pago: true } : multa
        )
      );
      Swal.fire("Sucesso", "Multa paga com sucesso.", "success");
    } catch (err) {
      console.error("Erro ao pagar multa:", err);
      Swal.fire("Erro", "Erro ao pagar multa.", "error");
    }
  };

  return (
    <div className="multas-container">
      <i
        className="fa-solid fa-arrow-left arrow-back"
        onClick={() => navigate("/home_biblio?page=1")}
      ></i>
      <h1 className="multas-title montserrat-alternates">Lista de Multas</h1>
      {loading ? (
        <p className="multas-loading montserrat-alternates">Carregando...</p>
      ) : multas.length === 0 ? (
        <p className="multas-empty montserrat-alternates">Nenhuma multa encontrada.</p>
      ) : (
        <table className="multas-table montserrat-alternates">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Valor Base</th>
              <th>Acréscimo</th>
              <th>Pago</th>
              <th>Títulos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {multas.map((multa) => (
              <tr key={multa.id_multa}>
                <td>{multa.nome}</td>
                <td>{multa.email}</td>
                <td>R$ {multa.valor_base}</td>
                <td>R$ {multa.valor_acrescimo}</td>
                <td>{multa.pago ? "Sim" : "Não"}</td>
                <td>{multa.titulos}</td>
                <td>
                  {!multa.pago && (
                    <button
                      onClick={() => handlePagarMulta(multa.id_multa)}
                      className="multas-button"
                    >
                      Pagar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Multas;
