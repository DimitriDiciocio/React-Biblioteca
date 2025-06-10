import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Swal from "sweetalert2";
import { usePermission } from "./usePermission";
import "../index.css";

const AddBanners: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    startdate: "",
    finishdate: "",
  });
  const [indeterminado, setIndeterminado] = useState(false); // Add this state
  const [isMobile, setIsMobile] = useState(false); // Add state for mobile checkbox

  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const navigate = useNavigate();

  const isAllowed = usePermission(2);

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

  if (isAllowed === null) return <p>Verificando permissão...</p>;
  if (!isAllowed) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestBody = new FormData();

    Object.keys(formData).forEach((key) => {
      requestBody.append(key, formData[key as keyof typeof formData]);
    });

    // Só envia o campo mobile se for true
    if (isMobile) {
      requestBody.append("mobile", "true");
    }

    if (banner) {
      requestBody.append("banner", banner);
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/banners", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: requestBody,
      });

      const result = await response.json();
      Swal.fire({
        icon: response.ok ? "success" : "error",
        title: response.ok ? "Sucesso" : "Erro",
        text: result.message || result.error,
      });

      if (response.ok) {
        setFormData({
          title: "",
          startdate: "",
          finishdate: "",
        });
        setBanner(null);
        setBannerPreview(null);
        setIndeterminado(false);

        // Dispatch event to update BannersAdm
        const updateEvent = new CustomEvent('bannersUpdated');
        window.dispatchEvent(updateEvent);
      }
    } catch (error) {
      console.error("Erro ao adicionar banner:", error);
    }
  };

  const handleRemoveBanner = () => {
    setBannerPreview(null);
    setBanner(null);
  };

  const handleCancelar = () => {
    setFormData({
      title: "",
      startdate: "",
      finishdate: "",
    });
    setBanner(null);
    setBannerPreview(null);
  };

  return (
    <div>
      <main className="background-blue padding-responsive">
        <div className="space-sm-y"></div>
        <div className="fake-header"></div>
        <section className="responsive-container center-x size-medium">
          <div className="d-flex-responsive">
            <i
              className="fa-solid fa-arrow-left arrow-back"
              onClick={() => navigate("/home_biblio?page=1")}
            ></i>
            <div
              {...getRootProps()}
              className="border-banner dropzone border-radius center-y"
              id="dropzone"
            >
              <input {...getInputProps()} />
              {bannerPreview ? (
                <>
                  <img src={bannerPreview} alt="Preview do banner" />
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveBanner();
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
                    ✕
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
                    name="startdate"
                    value={formData.startdate}
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
                    name="finishdate"
                    value={formData.finishdate}
                    onChange={handleChange}
                    required={!indeterminado}
                    disabled={indeterminado}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  checked={indeterminado}
                  onChange={(e) => {
                    setIndeterminado(e.target.checked);
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, finishdate: "" }));
                    }
                  }}
                  id="indeterminado"
                />
                <label htmlFor="indeterminado" className="montserrat-alternates-bold">
                  Por tempo indeterminado
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={isMobile}
                    onChange={(e) => setIsMobile(e.target.checked)}
                  />
                  <span className="montserrat-alternates-bold">É para mobile?</span>
              </div>
              <div className="d-flex g-sm m-top">
                <button
                  type="submit"
                  className="salvar montserrat-alternates-semibold"
                >
                  <span>Adicionar</span>
                </button>
                <button
                  type="button"
                  className="salvar cancelar montserrat-alternates-semibold"
                  onClick={handleCancelar}
                >
                  <span>Limpar</span>
                </button>
              </div>
            </form>
          </div>
        </section>
        
      </main>
    </div>
  );
};

export default AddBanners;
