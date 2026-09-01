import CalLogo from "../assets/cal.png";
import ZapierLogo from "../assets/zapier.png";
import MakeLogo from "../assets/make.png";
import n8nLogo from "../assets/n8n.png";
import { Popup } from "@/components/IntegrationPopup";
import { ShopifyIntegrationPopup } from "@/components/ShopifyIntegrationPopup";
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
  const [isShopifyOpen, setIsShopifyOpen] = useState(false);
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [hasShopify, setHasShopify] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchBusinessInfo = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}api/businessinfos/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const bData = await res.json();
        if (bData?.shopifyStoreUrl) {
          setHasShopify(true);
        } else {
          setHasShopify(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch business info for integrations", err);
    }
  };

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
        fetchBusinessInfo(userId);
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
  }, [API_URL, token]);

  console.log("userInfo", userInfo);

  return (
    <div>
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
      />
      <ShopifyIntegrationPopup
        isOpen={isShopifyOpen}
        onClose={() => {
          setIsShopifyOpen(false);
          if (userInfo?.id) fetchBusinessInfo(userInfo.id);
        }}
        userInfo={userInfo}
      />
      <div className="flex flex-col justify-start items-start px-[16px] md:px-6 py-6 gap-y-5.5 bg-background">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-2xl font-semibold text-left text-primary">
            Integrations
          </h3>
          <p className="text-sm font-medium text-left text-default-gray">
            Integrate voice agent with third party services
          </p>
        </div>
        <div className="w-full h-[1163px] px-0 md:px-7 py-7 border rounded-[12px] shadow-md bg-card">
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
              <p className="text-[20px] font-medium text-[var(--text-primary)]">n8n</p>
            </div>
            
            <div
              onClick={() => {
                setIsShopifyOpen(true);
              }}
              className="flex flex-col gap-y-3.5 cursor-pointer"
            >
              <div className="flex justify-center items-center border rounded-[8px] shadow-md h-[100px] md:h-[170px] w-[150px] md:w-[265px] bg-[#95BF47]/10">
                <svg viewBox="0 0 512 512" fill="currentColor" className="w-[50px] md:w-[80px] text-[#95BF47]">
                  <path d="M410.74,272.78c-26.6-47.53-29.28-76.31-29.47-78.71a4,4,0,0,0-2.48-3c-1.39-.53-62.19-21.32-82.72-27a19,19,0,0,1,1.06-2.52C310.22,135,322.84,103,322.84,103a3.52,3.52,0,0,0-1.89-4.32l-64-28.77a4.2,4.2,0,0,0-5.71,2.05l-49.49,110S190.27,175,188,174.19c-11.87-4.14-23.77-8.31-35.31-12.35a3.9,3.9,0,0,0-4.9,2.23l-38.38,88.4A21,21,0,0,0,109,255a20,20,0,0,0,6.07,13.88l39.06,35c-20.67,41.22-38.2,74.57-41.6,80.79a4,4,0,0,0,.69,4.72l44.6,44.59a3.89,3.89,0,0,0,5.55-.07c3.12-3.17,61.46-63,91-105C293,382,347.16,442.27,349.52,444.8a4,4,0,0,0,5.77,0l47.18-47.18a4,4,0,0,0,.8-4.7C399.85,386.4,414.13,328.79,410.74,272.78Zm-225-78,28.91-66.62C226.25,132.22,238.16,136.38,250,140.52L219,211.39c-2-2-4.11-4-6-5.88Zm65.25-103,46,20.69C291.68,127,279.79,157.17,267.31,180L222,225.59l42.6-94.67C265,130.13,264.44,129.84,251,125.76Zm-56,227.67c-17.76,33-51,75.76-67.6,92.51l-24.81-24.8L130,225c5.38,1.88,10.77,3.77,16.27,5.69,21,7.36,44.75,15.65,65,22.78Zm77-22L215.19,292l34.62,31-7,15.65,115.42,40.48-18.49,18.48c-28.53-41-80-98.81-83-102.16a3.84,3.84,0,0,1-.54-4.57c13.76-26.6,60-111.45,61.71-114.77,11,3,22.25,6.1,33.25,9.22a4.41,4.41,0,0,1,1.83.9C352,187,352.54,188,354.34,191.1c1,1.67,10,17.47,19.38,44ZM387,377l-15.6,15.6c-17.92-30.73-50.62-73.85-64.4-89.28L316.65,307C351.92,305.81,374.88,296,396,280.24,396.12,316,391.24,357.25,387,377Z" />
                </svg>
              </div>
              <p className="text-[20px] font-medium text-[var(--text-primary)]">Shopify</p>
              <p
                className={`${
                  hasShopify ? "flex" : "hidden"
                } justify-center py-[5px] text-[14px] font-medium text-primary bg-[#90EE90] rounded-[5px]`}
              >
                Integrated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;

