const Footer: React.FC = () => {
    return(
        <footer className="inter ">
            <div className="d-flex s-around">
            <section className="d-flex-column">
                <div className="d-flex center-y">
                    <img src="../assets/img/phone.png" alt="Icone telefone" className="icon-footer"/>
                    <p className="padding-left-footer montserrat-alternates">+55 (99) 99999-9999</p>
                </div>
                <div className="d-flex center-y montserrat-alternates ">
                    <img src="../assets/img/local.png" alt="Icone local" className="icon-footer"/>
                    <a target="_blank" href="https://www.google.com.br/maps/place/LIBRIS+-+FIC/@-16.6039392,-49.265832,17z/data=!3m1!4b1!4m6!3m5!1s0x935ef34af5367885:0x5198a5129421b439!8m2!3d-16.6039392!4d-49.2632571!16s%2Fg%2F11fjqk1xlh?hl=pt-PT&entry=ttu&g_ep=EgoyMDI1MDMxMi4wIKXMDSoASAFQAw%3D%3D" className="padding-left-footer text-decoration-none preto"><p>Rua Rua, 123 - Cidade/ESTADO</p></a>
                </div>
            </section>
            <div></div>
            <div className="tooltip-container" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><img className="read-raccoon pointer" src="/assets/img/red-raccoon.png" alt="" /><span className="tooltip-text montserrat-alternates">Voltar ao topo</span></div>
            <div></div>
            <section className="texto-invertido d-flex-column  montserrat-alternates">
                <p
                    className="delius-regular"
                >Read Raccoon
                </p>
                <p>ReadRaccoon@</p>
                <p>Todos os Direitos Reservados©</p>
            </section>
            </div>
            <div className="space-sm-y"></div>
        </footer>
    )
}
export default Footer;