import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import Header from "../components/Header";

interface Banner {
  title: string;
  startDate: string;
  finishDate: string;
  indefiniteEndDate?: boolean;
}

const DetalhesBanner: React.FC = () => {
  const { id_banner } = useParams<{ id_banner: string }>();
  const [formData, setFormData] = useState<Banner>({
    title: "",
    startDate: "",
    finishDate: "",
    indefiniteEndDate: false,
  });
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  useEffect(() => {
    const fetchBanner = async () => {
      if (!id_banner) {
        console.error("ID do banner não fornecido.");
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/banners/${id_banner}/biblios`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        
        // Check if finishDate is null or empty
        const isIndefinite = !data.banner.finishDate || data.banner.finishDate === '';
        
        setFormData({
          ...data.banner,
          startDate: new Date(data.banner.startDate)
            .toISOString()
            .split("T")[0],
          finishDate: isIndefinite ? '' : new Date(data.banner.finishDate)
            .toISOString()
            .split("T")[0],
          indefiniteEndDate: isIndefinite
        });

        if (data.banner.imagePath) {
          const imageUrl = `http://127.0.0.1:5000/uploads/banners/${data.banner.imagePath}`;
          setBannerPreview(imageUrl);

          // Optionally fetch the image as a File object
          const imgResponse = await fetch(imageUrl);
          if (imgResponse.ok) {
            const blob = await imgResponse.blob();
            const file = new File([blob], data.banner.imagePath, {
              type: blob.type,
            });
            setBanner(file);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do banner:", error);
      }
    };

    fetchBanner();
  }, [id_banner]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        finishDate: checked ? '' : prev.finishDate
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", formData.title);
    form.append("startdate", formData.startDate);
    form.append("finishdate", formData.indefiniteEndDate ? "" : formData.finishDate);
    form.append("indefiniteEndDate", String(formData.indefiniteEndDate));
    if (banner) {
      form.append("banner", banner);
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/banners/${id_banner}/biblios`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: form,
        }
      );

      const result = await response.json();
      Swal.fire({
        icon: response.ok ? "success" : "error",
        title: response.ok ? "Sucesso" : "Erro",
        text: result.message || result.error,
      });

      if (response.ok) {
        navigate("/home_biblio?page=6");
      }
    } catch (error) {
      console.error("Erro ao editar banner:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="fake-header"></div>
      <main className="background-blue padding-responsive">
        <div className="space-sm-y"></div>
        <section className="responsive-container center-x size-medium">
          <div className="d-flex-responsive">
            <i
              className="fa-solid fa-arrow-left arrow-back"
              onClick={() => navigate("/home_biblio?page=6")}
            ></i>
            <div
              {...getRootProps()}
              className="border-banner dropzone"
              id="dropzone"
            >
              <input {...getInputProps()} />
              {bannerPreview ? (
                <>
                  <img src={bannerPreview} alt="Preview do banner" />
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setBanner(null);
                      setBannerPreview(null);
                    }}
                    style={{
                      position: "absolute",
                      top: "0px",
                      right: "0px",
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                    }}
                  >
                    ✖
                  </button>
                </>
              ) : (
                <div className="dz-message pointer">
                  <p>Arraste e solte o banner aqui ou clique para selecionar</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="w-656">
              <div className="form-group">
                <label className="montserrat-alternates-semibold">
                  Título do Banner:
                </label>
                <input
                  className="input-p montserrat-alternates-semibold"
                  type="text"
                  name="title"
                  placeholder="Título"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="d-flex g-20">
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Data de Início:
                  </label>
                  <input
                    className="input-p montserrat-alternates-semibold"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="montserrat-alternates-semibold">
                    Data de Fim:
                  </label>
                  <input
                    className="input-p montserrat-alternates-semibold"
                    type="date"
                    name="finishDate"
                    value={formData.finishDate}
                    onChange={handleChange}
                    required={!formData.indefiniteEndDate}
                    disabled={formData.indefiniteEndDate}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-container montserrat-alternates-semibold">
                  <input
                    type="checkbox"
                    name="indefiniteEndDate"
                    checked={formData.indefiniteEndDate}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Banner sem data de término
                </label>
              </div>

              <div className="d-flex g-sm m-top">
                <button
                  type="submit"
                  className="salvar montserrat-alternates-semibold"
                >
                  <span>Salvar</span>
                </button>
                <button
                  type="button"
                  className="salvar cancelar montserrat-alternates-semibold"
                  onClick={() => navigate("/home_biblio?page=7")}
                >
                  <span>Cancelar</span>
                </button>
              </div>
            </form>
          </div>
        </section>
        <div className="fake-header"></div>
      </main>
    </div>
  );
};

export default DetalhesBanner;
