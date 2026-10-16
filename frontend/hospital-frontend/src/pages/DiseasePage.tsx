import { useParams, useNavigate } from "react-router-dom";
import { diseases } from "../data/diseases";
import "../styles/DiseasePage.css";

function DiseasePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const disease = diseases.find(d => d.id === id);

  if (!disease) {
    return <h2 style={{ padding: "40px" }}>Disease not found</h2>;
  }

  const handleBookAppointment = () => {
    navigate("/appointment", {
      state: {
        doctor: disease.doctor,
        reason: disease.name,
      },
    });
  };

  return (
    <div className="disease-page">
      {/* Hero */}
      <section className="disease-hero">
        <h1>{disease.name}</h1>
        <p>Specialized treatment & expert care</p>
      </section>

      {/* Content */}
      <section className="disease-content">
        <div className="disease-info">
          <h2>About {disease.name}</h2>
          <p>{disease.description}</p>
        </div>

        <div className="doctor-box">
          <h3>Consulting Doctor</h3>
          <p>
            <strong>Dr. T. Vijayaragavan</strong><br />
            M.B.B.S., M.S.<br />
            General Surgeon
          </p>

          <button onClick={handleBookAppointment}>
            Book Appointment
          </button>
        </div>
      </section>
    </div>
  );
}

export default DiseasePage;
