import React from "react";
import MostrarLivros from "../components/MostrarLivros";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MostrarTop from "../components/MostrarTop";
import PorqueVoceLeu from "../components/PorqueVoceLeu";
import Banners from "../components/Banners";
import Novidades from "../components/Novidades";
import MinhaListaCarrossel from "../components/MinhaListaCarrossel";
import Recomendados from "../components/Recomendados";

const Home: React.FC = () => {
  const token = localStorage.getItem("token");

  return (
    <div>
      <Header />
      <main className="background-blue">
        <Banners />
        <section>
          <p className="montserrat-alternates-semibold size-titles">
            Recomendados
          </p>
          <Recomendados />
        </section>
        <div className="space-med-y"></div>
        {token && (
          <>
            <MinhaListaCarrossel />
            <PorqueVoceLeu />
          </>
        )}
        <section>
          <p className="montserrat-alternates-semibold size-titles">
            Top 10 Livros da Semana
          </p>
          <MostrarTop />
        </section>
        <div className="space-med-y"></div>
        <section>
          <Novidades />
          <div className="space-ssm-y"></div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
