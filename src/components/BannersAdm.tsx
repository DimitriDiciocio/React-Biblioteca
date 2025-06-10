import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../services/FormatDate";

interface Banner {
  id_banner: number;
  title: string;
  startDate: string;
  finishDate: string;
  imagePath: string;
  position: number; // Add position property
  isMobile: boolean; // Add isMobile property
}

const BannersAdm: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  const fetchBanners = useCallback(async () => {
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
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Listen for banner updates
  useEffect(() => {
    const handleBannersUpdated = () => {
      fetchBanners();
    };

    window.addEventListener('bannersUpdated', handleBannersUpdated);

    return () => {
      window.removeEventListener('bannersUpdated', handleBannersUpdated);
    };
  }, [fetchBanners]);

  const handleDragStart = (event: React.DragEvent<HTMLTableRowElement>, index: number) => {
    event.dataTransfer.setData("text/plain", index.toString());
    event.currentTarget.style.opacity = "0.7"; // Make the dragged row semi-transparent
    event.currentTarget.style.backgroundColor = "#f0f8ff"; // Highlight the dragged row
  };

  const handleDragEnd = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.opacity = "1"; // Restore the row's opacity
    event.currentTarget.style.backgroundColor = ""; // Remove the highlight
  };

  const moveBanner = (index: number, direction: "up" | "down") => {
    const updatedBanners = [...banners];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= updatedBanners.length) return;

    const [movedBanner] = updatedBanners.splice(index, 1);
    updatedBanners.splice(targetIndex, 0, movedBanner);

    setBanners(updatedBanners);

    try {
      fetch("http://127.0.0.1:5000/banners/position", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          banners: updatedBanners.map((banner, idx) => ({
            id_banner: banner.id_banner,
            position: idx + 1,
          })),
        }),
      });
    } catch (error) {
      console.error("Erro ao atualizar posições:", error);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLTableRowElement>, targetIndex: number) => {
    event.preventDefault();
    const sourceIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);

    if (sourceIndex === targetIndex) return;

    const updatedBanners = [...banners];
    const [movedBanner] = updatedBanners.splice(sourceIndex, 1);
    updatedBanners.splice(targetIndex, 0, movedBanner);

    setBanners(updatedBanners);

    try {
      await fetch("http://127.0.0.1:5000/banners/position", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          banners: updatedBanners.map((banner, index) => ({
            id_banner: banner.id_banner,
            position: index + 1,
          })),
        }),
      });
    } catch (error) {
      console.error("Erro ao atualizar posições:", error);
    }

    event.currentTarget.style.borderTop = ""; // Remove the drop area highlight
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
    event.currentTarget.style.borderTop = "3px solid #007bff"; // Highlight the drop area
  };

  const handleDragLeave = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.borderTop = ""; // Remove the highlight
  };

  const handleDelete = async (id_banner: number) => {
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
            <th className="montserrat-alternates-semibold">Mover</th> {/* Add column for drag icon */}
            <th className="montserrat-alternates-semibold">Imagem</th>
            <th className="montserrat-alternates-semibold">Título</th>
            <th className="montserrat-alternates-semibold">Data de Início</th>
            <th className="montserrat-alternates-semibold">Data de Fim</th>
            <th className="montserrat-alternates-semibold">Ações</th>
            <th className="montserrat-alternates-semibold">Mobile</th> {/* Add column for mobile */}
          </tr>
        </thead>
        <tbody>
          {banners.map((banner, index) => (
            <tr
              className="montserrat-alternates-semibold"
              key={banner.id_banner}
              draggable
              onDragStart={(event) => handleDragStart(event, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(event) => handleDrop(event, index)}
              style={{ transition: "background-color 0.3s, opacity 0.3s" }} // Smooth transition for visual effects
            >
              <td style={{ textAlign: "center", width: "50px" }}> {/* Drag icon column */}
                <span
                  className="material-icons"
                  style={{
                    cursor: "grab",
                    fontSize: "24px",
                    color: "#007bff",
                  }}
                  title="Arraste para mover"
                >
                  drag_indicator
                </span>
              </td>
              <td style={{ width: "120px" }}> {/* Image column */}
                <img
                  src={`http://127.0.0.1:5000/uploads/banners/${banner.id_banner}.jpeg`}
                  alt={banner.title}
                  style={{ width: "100px", height: "50px", objectFit: "cover", borderRadius: "5px" }} // Rounded corners for images
                />
              </td>
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
              <td style={{ textAlign: "center" }}> {/* Mobile column */}
                {banner.mobile ? "Sim" : "Não"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BannersAdm;
