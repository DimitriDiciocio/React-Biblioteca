import React, { useEffect, useState } from "react";

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
      {banners.map((banner, index) => (
        <div key={index} className="banner-item">
          <img
            src={`http://127.0.0.1:5000/uploads/banners/${banner.imagePath}`}
            alt={banner.title}
            className="banner-image"
          />
        </div>
      ))}
    </div>
  );
};

export default Banners;
