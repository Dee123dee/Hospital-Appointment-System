import { useParams, useNavigate } from "react-router-dom";
import { diseases } from "../data/diseases";
import "../styles/DiseasePage.css";

function DiseasePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const disease = diseases.find(d => d.id === id);

  if (!disease) {
    return <h2 style={{ padding: "20px" }}>Disease not found</h2>;
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
      <div className="disease-container">
        <h1>{disease.name}</h1>

        <p className="disease-desc">
          {disease.description ||
            "This condition requires proper medical evaluation and timely treatment to avoid complications."}
        </p>

        <div className="info-section">
          <div>
            <h3>Common Symptoms</h3>
            <ul>
              <li>Pain or discomfort</li>
              <li>Swelling or inflammation</li>
              <li>Difficulty in daily activities</li>
            </ul>
          </div>

          <div>
            <h3>Treatment Options</h3>
            <ul>
              <li>Medical management</li>
              <li>Minor procedures</li>
              <li>Surgical intervention if required</li>
            </ul>
          </div>
        </div>

        <div className="doctor-box">
          <h3>Consulting Doctor</h3>
          <p>
            <strong>{disease.doctor}</strong> <br />
            M.B.B.S., M.S. <br />
            General Surgeon
          </p>
        </div>

        <button className="book-btn" onClick={handleBookAppointment}>
          Book Appointment
        </button>
      </div>
    </div>
  );
}

export default DiseasePage;
