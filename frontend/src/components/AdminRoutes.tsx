import { Navigate, Outlet } from "react-router-dom";
import { AppUser } from "@/AppContext";

const AdminRoute = () => {
  const { user } = AppUser();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not admin
  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized
  return <Outlet />;
};

export default AdminRoute;
