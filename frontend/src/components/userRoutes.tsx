// components/UserRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { AppUser } from "@/AppContext";

const UserRoute = () => {
  const { user } = AppUser();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "user") return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default UserRoute;
