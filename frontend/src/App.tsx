import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Dashboard from "./dashboard/Dashboard";
import Home from "./pages/Home";
import VoiceAgent from "./dashboard/voiceAgent";
import CallHistory from "./dashboard/callHistory";
import Integrations from "./dashboard/Integrations";
import Settings from "./dashboard/Settings";
import GetStarted from "./dashboard/getStarted";
import Feedback from "./dashboard/Feedback";
import HelpCenter from "./dashboard/helpCenter";
import Overview from "./dashboard/Overview";
import { Login } from "./auth/login";
import { Email } from "./auth/Email";
import { Forgot_password } from "./auth/Forgot_password";
import { New_password } from "./auth/New_password";
import { Password_reset } from "./auth/Password_reset";
import { SignUp } from "./auth/SignUp";
import { Toaster } from "sonner";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";
import PaymentSuccess from "./pages/PaymentSuccess";
import Users from "./dashboard/Users";
import CallHistoryLogs from "./dashboard/CallHistoryLogs";
import Plans from "./dashboard/Plans";
import CreatePlan from "./components/CreatePlan";
import RestrictedRoute from "./components/RestrictedRoutes";
import AdminRoute from "./components/AdminRoutes";
import Unauthorized from "./components/unauthorized";
import UserRoute from "./components/userRoutes";
import PromptEditor from "./components/PromptEditor";
function App() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token");
    const isImpersonatingURL = urlParams.get("impersonating") === "true";

    if (tokenFromURL && isImpersonatingURL && !sessionStorage.getItem("authToken")) {
      sessionStorage.setItem("authToken", tokenFromURL);
      sessionStorage.setItem("isImpersonating", "true");
      urlParams.delete("token");
      const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams}` : ""}`;
      window.history.replaceState({}, "", newUrl);
      window.location.reload(); // Force reload to ensure Router picks up the new state
    } else if (tokenFromURL && !isImpersonatingURL) {
      localStorage.setItem("authToken", tokenFromURL);
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState({}, "", newUrl);
      // Removed window.location.reload() to prevent login loop and rely on React Router
    }
  }, []);
  // if (isImpersonatingURL) {
  //   sessionStorage.setItem("isImpersonating", "true");
  // } else {
  //   sessionStorage.removeItem("isImpersonating");
  // }
  return (
    <div className="w-full max-w-full ">
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/email" element={<Email />} />
            <Route path="/forgot-password" element={<Forgot_password />} />
            <Route path="/new-password" element={<New_password />} />
            <Route path="/password-reset" element={<Password_reset />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route element={<RestrictedRoute />}>
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route path="dashboard" element={<Dashboard />}>
                <Route path="" element={<Overview />} />
                <Route path="settings" element={<Settings />} />
                <Route element={<UserRoute />}>
                  <Route path="integrations" element={<Integrations />} />
                  <Route path="voiceAgent" element={<VoiceAgent />} />
                </Route>
                <Route element={<AdminRoute />}>
                  <Route path="logsHistory" element={<CallHistoryLogs />} />
                  <Route path="Prompt" element={<PromptEditor />} />
                  <Route path="users" element={<Users />} />
                  <Route path="plans" element={<Plans />} />
                  <Route path="create-plan" element={<CreatePlan />} />
                  <Route path="create-plan/:id" element={<CreatePlan />} />
                </Route>
                <Route path="callHistory" element={<CallHistory />} />

                <Route path="getStarted" element={<GetStarted />} />
                <Route path="helpCenter" element={<HelpCenter />} />
                <Route path="feedback" element={<Feedback />} />
              </Route>
            </Route>
          </Route>

          <Route path="success" element={<PaymentSuccess />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
