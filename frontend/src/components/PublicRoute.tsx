// import { Navigate, Outlet } from "react-router-dom";

// const isAuthenticated = () => {
//     return !!localStorage.getItem("authToken");
// };

// const PublicRoute = () => {
//     return isAuthenticated() ? <Navigate to="/dashboard" replace  /> : <Outlet />;
// };

// export default PublicRoute;
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isAuthenticated = () => {
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

  if (!token) return false;

  try {
    const decoded: { exp: number } = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("authToken");
      return false;
    }
    return true;
  } catch (err) {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("authToken");
    return false;
  }
};

const PublicRoute = () => {
  const location = useLocation();

  const isGoogleSignup = location.pathname === "/signup";

  if (isAuthenticated() && !isGoogleSignup) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
