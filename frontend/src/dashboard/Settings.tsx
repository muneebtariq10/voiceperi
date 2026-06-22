import Account from "@/components/Account";
import PlanAndBilling from "@/components/PlanAndBilling";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppUser } from "@/AppContext";
const Settings = () => {
  const { user } = AppUser();
  const [activeTab, setActiveTab] = useState("account");
  const location = useLocation();
  useEffect(() => {
    if (location.hash === "#payment-plans") {
      setActiveTab("plan");

      // Wait for the PlanAndBilling component to mount before scrolling
      setTimeout(() => {
        const element = document.getElementById("payment-plans");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 200); // adjust if necessary
    }
  }, [location]);
  return (
    <div>
      <div className="w-full px-[16px] md:px-6 py-7">
        <div className="w-full p-4 md:p-7 border rounded-lg shadow-md">
          <div className="flex justify-start border-b gap-x-2">
            <button
              className={`py-2 cursor-pointer px-4 text-[24px] md:text-2xl font-semibold ${
                activeTab === "account"
                  ? "border-b-2 text-default-purple border-blue-500 font-semibold"
                  : ""
              }`}
              onClick={() => setActiveTab("account")}
            >
              Account
            </button>
            {user?.role === "user" && (
              <button
                className={`py-2 cursor-pointer  px-4 text-[20px] md:text-2xl font-semibold ${
                  activeTab === "plan"
                    ? "border-b-2 text-default-purple border-blue-500 font-semibold"
                    : ""
                }`}
                onClick={() => setActiveTab("plan")}
              >
                Plan & Billing
              </button>
            )}
          </div>
          {user?.role === "user" && (
            <div className="mt-11">
              {activeTab === "account" ? <Account /> : <PlanAndBilling />}
            </div>
          )}
          {user?.role === "admin" && (
            <div className="mt-11">
              {activeTab === "account" && <Account />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
