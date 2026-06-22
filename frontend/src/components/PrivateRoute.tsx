import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";
const isAuthenticated = () => {
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const decoded: { exp: number } = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      return false;
    }
    return true;
  } catch (err) {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    return false;
  }
};

const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
