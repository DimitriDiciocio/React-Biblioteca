import React from "react";
import MostrarLivros from "../components/MostrarLivros";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MostrarTop from "../components/MostrarTop";
import PorqueVoceLeu from "../components/PorqueVoceLeu";
import Banners from "../components/Banners";

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
          <MostrarLivros />
        </section>
        <div className="space-med-y"></div>
        {token && (
          <>
            <section>
              <p className="montserrat-alternates-semibold size-titles">
                Minha Lista
              </p>
              <MostrarLivros />
            </section>
            <div className="space-med-y"></div>
          </>
        )}
        {token && (
          <>
            <section>
              <p className="montserrat-alternates-semibold size-titles">
                Por que você leu
              </p>
              <PorqueVoceLeu />
            </section>
            <div className="space-med-y"></div>
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
          <p className="montserrat-alternates-semibold size-titles">
            Novidades
          </p>
          <MostrarLivros />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
