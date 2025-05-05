import React from "react";
import MostrarLivros from "../components/MostrarLivros";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MostrarTop from "../components/MostrarTop";

const Home: React.FC = () => {
  const token = localStorage.getItem("token");

  return (
    <div>
      <Header />
      <main className="background-blue">
        <section>
          <img src="" alt="" />
        </section>
        <section>
          <img src="" alt="" />
          <img src="" alt="" />
          <img src="" alt="" />
          <img src="" alt="" />
        </section>
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
              <MostrarLivros />
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
        <div className="space-med-y"></div>
        {token && (
          <>
            <section>
              <p className="montserrat-alternates-semibold size-titles">
                Por que você leu
              </p>
              <MostrarLivros />
            </section>
            <div className="space-med-y"></div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
