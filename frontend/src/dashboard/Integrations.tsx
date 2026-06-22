import CalLogo from "../assets/cal.png";
import ZapierLogo from "../assets/zapier.png";
import MakeLogo from "../assets/make.png";
import n8nLogo from "../assets/n8n.png";
import { Popup } from "@/components/IntegrationPopup";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface UserInfo {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
  event_id: string;
}

const Integrations = () => {
  const [isOpen, setIsOpen] = useState(false);
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async (userId: string) => {
      try {
        const response = await fetch(`${API_URL}api/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.sub) {
          fetchUser(decoded.sub);
        } else {
          console.warn("No userId found in decoded token");
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  console.log("userInfo", userInfo);

  return (
    <div>
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
      />
      <div className="flex flex-col justify-start items-start px-[16px] md:px-6 py-6 gap-y-5.5 bg-[#fafafb]">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-2xl font-semibold text-left text-primary">
            Integrations
          </h3>
          <p className="text-sm font-medium text-left text-default-gray">
            Integrate voice agent with third party services
          </p>
        </div>
        <div className="w-full h-[1163px] px-0 md:px-7 py-7 border rounded-[12px] shadow-md bg-white">
          <div className="grid grid-cols-2 justify-items-center gap-x-2 gap-y-[20px] md:grid-cols-4 p-5">
            <div
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              className="flex flex-col gap-y-3.5 cursor-pointer"
            >
              <div className="flex justify-center items-center border rounded-[8px] shadow-md h-[100px] md:h-[170px] w-[150px] md:w-[265px]">
                <img
                  src={CalLogo}
                  alt="cal-logo"
                  className="w-[50px] md:w-20 "
                />
              </div>
              <p className="text-[20px] font-medium text-primary">Cal.com</p>
              <p
                className={`${
                  userInfo?.event_id ? "flex" : "hidden"
                } justify-center py-[5px] text-[14px] font-medium text-primary bg-[#90EE90] rounded-[5px]`}
              >
                Integrated
              </p>
            </div>
            <div className="flex flex-col gap-y-3.5 cursor-pointer">
              <div className="flex justify-center items-center border rounded-[8px] shadow-md h-[100px] md:h-[170px] w-[150px] md:w-[265px]">
                <img
                  src={ZapierLogo}
                  alt="zapier-logo"
                  className="w-[100px] md:w-[170px]"
                />
              </div>
              <p className="text-[20px] font-medium text-primary">Zapier</p>
            </div>
            <div className="flex flex-col gap-y-3.5 cursor-pointer">
              <div className="flex justify-center items-center border rounded-[8px] shadow-md h-[100px] md:h-[170px] w-[150px] md:w-[265px]">
                <img
                  src={MakeLogo}
                  alt="make-logo"
                  className="w-[100px] md:w-[170px]"
                />
              </div>
              <p className="text-[20px] font-medium text-primary">Make</p>
            </div>
            <div className="flex flex-col gap-y-3.5 cursor-pointer">
              <div className="flex justify-center items-center border rounded-[8px] shadow-md h-[100px] md:h-[170px] w-[150px] md:w-[265px]">
                <img
                  src={n8nLogo}
                  alt="n8n-logo"
                  className="w-[100px] md:w-[170px]"
                />
              </div>
              <p className="text-[20px] font-medium text-primary">n8n</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
