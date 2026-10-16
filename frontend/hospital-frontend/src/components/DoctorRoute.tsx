import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

const DoctorRoute = ({ children }: { children: ReactElement }) => {
  const doctorUser = localStorage.getItem("doctorUser");

  return doctorUser ? children : <Navigate to="/doctor-login" />;
};

export default DoctorRoute;
