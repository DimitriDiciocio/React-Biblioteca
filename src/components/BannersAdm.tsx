import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { formatDate } from "../services/FormatDate";

interface Banner {
  id_banner: number;
  title: string;
  startDate: string;
  finishDate: string;
  imagePath: string;
}

const BannersAdm: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/banners/biblios", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setBanners(data.banners);
      } catch (error) {
        console.error("Erro ao buscar banners:", error);
      }
    };

    fetchBanners();
  }, []);

  const handleDelete = async (  id_banner: number) => {
    const confirm = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter esta ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/banners/${id_banner}/biblios`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const result = await response.json();
        Swal.fire({
          icon: response.ok ? "success" : "error",
          title: response.ok ? "Sucesso" : "Erro",
          text: result.message || result.error,
        });

        if (response.ok) {
          setBanners(
            banners.filter((banner) => banner.id_banner !== id_banner)
          );
        }
      } catch (error) {
        console.error("Erro ao deletar banner:", error);
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-between align-center montserrat-alternates-semibold">
        <h1>Banners</h1>

      </div>
      <table className="table">
        <thead>
          <tr>
            <th className="montserrat-alternates-semibold">Título</th>
            <th className="montserrat-alternates-semibold">Data de Início</th>
            <th className="montserrat-alternates-semibold">Data de Fim</th>
            <th className="montserrat-alternates-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr  className="montserrat-alternates-semibold" key={banner.id_banner}>
              <td>{banner.title}</td>
              <td>{formatDate(banner.startDate)}</td>
              <td>{formatDate(banner.finishDate)}</td>
              <td>
                <div className="g-ssm">
                  <button
                    className="btn btn-secondary montserrat-alternates-semibold"
                    onClick={() =>
                      navigate(`/detalhesBanner/${banner.id_banner}`)
                    }
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger montserrat-alternates-semibold"
                    onClick={() => handleDelete(banner.id_banner)}
                  >
                    Deletar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BannersAdm;
