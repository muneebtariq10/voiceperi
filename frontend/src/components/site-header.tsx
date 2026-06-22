import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { BellDot, ChevronDown, Search } from "lucide-react";
import { Notification } from "./Notification";
import { SidebarTrigger } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface DecodedToken {
  firstname?: string;
  lastname?: string;
  email?: string;
  sub?: string;
  image?: string;
}

export function SiteHeader() {
  const isImpersonating = sessionStorage.getItem("isImpersonating") === "true";

  const [showNotification, setShowNotification] = useState(false);
  const handleNotification = () => {
    setShowNotification(!showNotification);
  };
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [currentUserInfo, setCurrentUserInfo] = useState<DecodedToken | null>(
    null
  );

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token =
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("authToken") ||
    "";

  console.log("currentUserInfo", currentUserInfo);

  useEffect(() => {
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);

        setUserInfo(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}api/users/${userInfo?.sub}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = await res.json();
        setCurrentUserInfo(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userInfo?.sub && token) {
      fetchUser();
    }
  }, [userInfo?.sub, token]);

  const handleLogout = () => {
    const tokenImpersonated = sessionStorage.getItem("authToken");
    if (tokenImpersonated) {
      sessionStorage.removeItem("authToken");
      if (window.opener) {
        window.close();
      } else {
        navigate("/login");
      }
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user_id");
      window.location.href = "/login";
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="flex bg-white h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6 py-2 md:py-7">
        <SidebarTrigger className="-ml-1 min-w-10" />
        <h3 className="font-semibold hidden md:block md:text-2xl">
          Hello, {currentUserInfo?.firstname} {currentUserInfo?.lastname} 👋{" "}
          {isImpersonating && (
            <span className="text-red-500 text-sm font-medium ml-2">
              (Impersonating as user)
            </span>
          )}
        </h3>
        <div className="ml-auto flex items-center gap-x-4.5">
          <Search className="cursor-pointer text-default-gray" />
          <div className="relative">
            <BellDot
              onClick={handleNotification}
              // onClick={setShowNotification(!showNotification)}
              className="cursor-pointer text-default-gray"
            />
            <Notification
              className={`${
                showNotification ? "flex" : "hidden"
              } absolute left-[-30px] md:left-[-120px] -translate-x-1/2 md:translate-x-0 top-[40px] z-10 py-3`}
            />
          </div>
          <div className="border-l-3 h-5 text-default-gray"></div>
          <Avatar className="cursor-pointer">
            <AvatarImage
              className="object-cover w-full h-full"
              src={
                currentUserInfo?.image
                  ? currentUserInfo.image.startsWith("http")
                    ? currentUserInfo.image
                    : `${API_URL}${currentUserInfo.image}`
                  : "https://github.com/shadcn.png"
              }
            />
          </Avatar>
          <div className="hidden md:block">
            <p className="text-[12px] md:text-[16px] font-bold text-left text-primary">
              {currentUserInfo?.firstname} {currentUserInfo?.lastname}
            </p>
            <p className="text-sm font-medium text-left text-default-gray">
              {currentUserInfo?.email}
            </p>
          </div>
          <div className="relative">
            <div
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex w-[40px] hover:bg-gray-100 h-[30px] justify-center items-center gap-1 cursor-pointer"
            >
              <ChevronDown
                width={16}
                className={`transform transition-transform duration-800 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {menuOpen && (
              <div className="absolute  right-0 mt-2 w-fit text-nowrap bg-white border rounded shadow-md z-10">
                <p
                  className="px-4 py-4 text-[14px] font-[500] cursor-pointer hover:bg-gray-50"
                  onClick={handleLogout}
                >
                  Log Out
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default SiteHeader;
