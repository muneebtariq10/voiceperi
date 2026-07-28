// components/UserRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { AppUser } from "@/AppContext";

const UserRoute = () => {
  const { user } = AppUser();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "user" && user.role !== "admin" && user.role !== "super_admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
