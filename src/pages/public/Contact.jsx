import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";

function Contact() {
  return (
    <PageTransition>
      <PublicLayout>
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">Contacto</span>
              <h1 className="section-title">Hablemos</h1>
              <p className="section-text">
                Podés escribirnos por WhatsApp para realizar consultas, coordinar
                turnos y recibir atención personalizada.
              </p>
            </div>

            <div className="inquiry-info-card">
              <strong>WhatsApp</strong>
              <p>+54 9 381 5448147</p>
            </div>

            <div className="inquiry-info-card" style={{ marginTop: "1rem" }}>
              <strong>Horario de atención</strong>
              <p>Lunes a viernes de 9:30 a 16:30</p>
            </div>
          </div>
        </section>
      </PublicLayout>
    </PageTransition>
  );
}

export default Contact;