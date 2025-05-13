import React, { useEffect, useState } from "react";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

interface Banner {
  title: string;
  startDate: string;
  finishDate: string;
  imagePath: string;
}

const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/banners/users");
        const data = await response.json();
        setBanners(data.banners);
      } catch (error) {
        console.error("Erro ao buscar banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div>
      <OwlCarousel
        className="owl-theme"
        loop={true}
        nav={false}
        dots={true}
        autoplay={true}
        autoplayTimeout={5000}
        autoplayHoverPause={true}
        items={1}
      >
        {banners.map((banner, index) => (
          <div key={index} className="banner-item">
            <img
              src={`http://127.0.0.1:5000/uploads/banners/${banner.imagePath}`}
              alt={banner.title}
              className="banner-image"
            />
          </div>
        ))}
      </OwlCarousel>
    </div>
  );
};

export default Banners;