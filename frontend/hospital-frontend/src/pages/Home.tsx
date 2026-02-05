import { Link } from "react-router-dom";
import { diseases } from "../data/diseases";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-overlay">
          <h1>V.R. Hospital</h1>
          <p>Trusted Surgical & Medical Care for Your Family</p>

    <div className="hero-hours">
      <span>🕘 9:00 AM – 2:00 PM</span>
      <span>🌙 5:30 PM – 9:00 PM</span>
    </div>
  </div>
</header>

      {/* Diseases */}
      <section>
        <h2>We Treat</h2>

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

      {/* Doctor Info */}
      <section className="doctor-card">
        <h2>Our Doctor</h2>
        <p>
          <strong>Dr. T. Vijayakumar</strong> <br />
          M.B.B.S., M.S. <br />
          General Surgeon
        </p>
      </section>
      {/* About Hospital */}
<section className="about-card">
  <h2>About V.R. Hospital</h2>
  <p>
    V.R. Hospital is a trusted multi-specialty healthcare center providing
    quality medical services with compassion and care. With experienced
    doctors, modern facilities, and patient-first approach, we are committed
    to delivering safe and effective treatment to our community.
  </p>

  <p>
    Our hospital specializes in general surgery, chronic disease management,
    emergency care, and preventive health services. We believe in ethical
    medical practice and personalized treatment for every patient.
  </p>
</section>

      {/* Contact */}
      <footer className="contact-card">
        📞 <strong>70947 56884</strong> / <strong>94868 02130</strong>
      </footer>
    </div>
  );
}

export default Home;
