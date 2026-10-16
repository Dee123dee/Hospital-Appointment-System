import { Link } from "react-router-dom";
import { diseases } from "../data/diseases";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">

      {/* ===== HERO SECTION ===== */}
      <header className="hero">
        <div className="hero-overlay">
          <h1>V.R. Hospital</h1>
          <p>Trusted Surgical & Medical Care for Your Family</p>

          <div className="hero-hours">
            <span>🕘 9:00 AM – 2:00 PM</span>
            <span>🌙 5:30 PM – 9:00 PM</span>
          </div>

          <Link to="/appointment" className="hero-btn">
              Book Appointment
          </Link>
        </div>
      </header>

      {/* ===== ABOUT HOSPITAL ===== */}
      <section className="about-card">
        <h2>About V.R. Hospital</h2>
        <p>
          V.R. Hospital is a trusted multi-specialty healthcare center committed
          to delivering high-quality medical care with compassion, integrity,
          and excellence. We combine experienced medical professionals with
          modern infrastructure to ensure safe and effective treatment.
        </p>

        <p>
          Our hospital focuses on patient-first care, ethical medical practice,
          and long-term health outcomes. We proudly serve our community with
          reliable diagnosis, surgical expertise, and continuous support.
        </p>
      </section>

      {/* ===== SERVICES / DISEASES ===== */}
      <section>
        <h2>Our Medical Services</h2>
        <p className="section-intro">
          We provide comprehensive diagnosis and treatment for a wide range of
          medical and surgical conditions.
        </p>

        <div className="disease-grid">
          {diseases.map(d => (
            <div key={d.id} className="disease-card">
              <h4>{d.name}</h4>
              <Link to={`/disease/${d.id}`} className="view-btn">
                View & Book
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DOCTOR ===== */}
      <section className="doctor-card">
        <h2>Our Doctor</h2>
        <p>
          <strong>Dr. T. Vijayaragavan</strong> <br />
          M.B.B.S., M.S. <br />
          General Surgeon
        </p>
      </section>

      {/* ===== CONTACT ===== */}
      <footer className="contact-card">
        📞 <strong>70947 56884</strong> / <strong>94868 02130</strong>
      </footer>

    </div>
  );
}

export default Home;
