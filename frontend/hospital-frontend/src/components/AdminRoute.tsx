import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: { children: ReactElement }) => {
  const isAdmin = localStorage.getItem("isAdmin");

  return isAdmin ? children : <Navigate to="/admin-login" />;
};

export default AdminRoute;

