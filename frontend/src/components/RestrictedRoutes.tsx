import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppUser } from "@/AppContext";

// 36-hour deactivation logic
// const isUserDeactivated = (deactivateTime: string | null) => {
//   if (!deactivateTime || deactivateTime === "null") return false;

//   const deactivatedAt = new Date(deactivateTime).getTime();
//   const now = Date.now();
//   const hours36 = 36 * 60 * 60 * 1000;

//   return now < deactivatedAt + hours36; // true means user is still within deactivation window
// };
const isUserDeactivated = (
  deactivateTime: string | null | undefined
): boolean => {
  if (!deactivateTime || deactivateTime === "null") return false;

  const deactivatedAt = new Date(deactivateTime).getTime();
  const now = Date.now();
  const hours36 = 36 * 60 * 60 * 1000;

  return now < deactivatedAt + hours36;
};

const RestrictedRoute = () => {
  const { user } = AppUser();
  const location = useLocation();

  const isDeactivated = isUserDeactivated(user?.deActivateTime);
  const isAccessingSettings = location.pathname === "/dashboard/settings";

  // Don't redirect if user isn't fully loaded yet
  if (!user) {
    return null; // or a loading spinner
  }

  if (isDeactivated && !isAccessingSettings) {
    return <Navigate to="/dashboard/settings" replace />;
  }

  return <Outlet />;
};

export default RestrictedRoute;
