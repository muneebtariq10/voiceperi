import * as React from "react";
import { useState, useEffect } from "react";
import {
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconHome,
  IconMessage,
  IconRocket,
  IconSettings,
  IconUsers,
  IconClipboardTypographyFilled,
} from "@tabler/icons-react";
// import { NavDocuments } from "@/components/nav-documents"
import { AppUser } from "@/AppContext";
import { NavMain } from "@/components/nav-main";
import { jwtDecode } from "jwt-decode";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "../assets/logo1.png";
import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, PhoneCall, SwatchBook, Logs } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import axios from "axios";
import { Invoice } from "./PlanAndBilling";

interface DecodedToken {
  firstname?: string;
  email?: string;
  sub?: string;
  // add any custom fields your token includes
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [subscribedPlan, setSubscribedPlan] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [usedMinutes, setUsedMinutes] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const progressPercentage = (usedMinutes / totalMinutes) * 100;
  const RemainingMinutes = totalMinutes - usedMinutes;
  const { user } = AppUser();
  console.log(user, "user inside side bar + user.admin", user?.role);
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: IconHome,
      },
      {
        title: "Voice agent",
        url: "/dashboard/voiceAgent",
        icon: IconUsers,
        show: user?.role === "user",
      },
      {
        title: "Call History",
        url: "/dashboard/callHistory",
        icon: PhoneCall,
      },
      {
        title: "Integrations",
        url: "/dashboard/integrations",
        icon: LayoutDashboard,
        show: user?.role === "user",
      },

      ...(user?.role === "admin"
        ? [
            {
              title: "Users",
              url: "/dashboard/Users",
              icon: IconUsers,
              show: true,
            },
            {
              title: "Call Logs",
              url: "/dashboard/LogsHistory",
              icon: Logs,
              show: true,
            },
            {
              title: "Plans",
              url: "/dashboard/plans",
              icon: SwatchBook,
              show: true,
            },
            {
              title: "Prompt",
              url: "/dashboard/prompt",
              icon: IconClipboardTypographyFilled,
              show: true,
            },
          ]
        : []),
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: IconSettings,
      },
    ].filter((item) => item.show !== false),

    navClouds: [
      {
        title: "Capture",
        icon: IconCamera,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Proposal",
        icon: IconFileDescription,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Prompts",
        icon: IconFileAi,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Get Started",
        url: "/dashboard/getStarted",
        icon: IconRocket,
      },
      {
        title: "Help Center",
        url: "/dashboard/helpCenter",
        icon: IconHelp,
      },
      {
        title: "Feedback",
        url: "/dashboard/feedback",
        icon: IconMessage,
      },
    ],
    // documents: [
    //   {
    //     name: "Data Library",
    //     url: "#",
    //     icon: IconDatabase,
    //   },
    //   {
    //     name: "Reports",
    //     url: "#",
    //     icon: IconReport,
    //   },
    //   {
    //     name: "Word Assistant",
    //     url: "#",
    //     icon: IconFileWord,
    //   },
    // ],
  };
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
  console.log("userinfo", userInfo?.sub);
  useEffect(() => {
    if (!userInfo?.sub) return;

    const timer = setTimeout(() => {
      const fetchUsage = async () => {
        try {
          const response = await axios.get(
            `${API_URL}api/usage/${userInfo.sub}`
          );
          const data = response.data;

          const total = Math.round(
            (data.previousPlanRemainingMinutes || 0) +
              (data.allowedMinutes || 0)
          );
          const used = Math.round(data.usedMinutes || 0);

          setTotalMinutes(total);
          setUsedMinutes(used);
        } catch (error) {
          console.error("Error fetching usage data:", error);
        }
      };

      fetchUsage();
    }, 2000); // Delay of 2 seconds

    return () => clearTimeout(timer); // Cleanup
  }, [userInfo?.sub]);
  console.log("total minutes", totalMinutes);

  console.log("used minutes", usedMinutes);
  // 2. Fetch Billing History (trigger only when userInfo is available)
  useEffect(() => {
    // if (!userInfo?.sub) return;

    const fetchBilling = async () => {
      if (!userInfo?.sub) {
        console.error(
          "User ID (sub) is undefined. Skipping billing history fetch."
        );
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}api/billing-history/${userInfo.sub}`
        );
        const formattedData = response.data.map((item: Invoice) => {
          const rawDate = new Date(item.current_period_start);
          const formattedDate = rawDate
            .toLocaleString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
            .replace(" at", "");

          const invoiceMonthYear = rawDate.toLocaleString("en-GB", {
            month: "long",
            year: "numeric",
          });

          return {
            ...item,
            id: item.id,
            amount: item.amount,
            invoice: invoiceMonthYear,
            plan: item.paymentPlan?.title ?? "N/A",
            billingDate: formattedDate,
            invoice_url: item.invoice_url,
            invoice_pdf_url: item.invoice_pdf_url,
          };
        });

        const activePlans = formattedData.filter((plan: any) => {
          const endDate = new Date(plan.current_period_end);
          return endDate.getTime() > Date.now();
        });

        setSubscribedPlan(activePlans);

        const latestSelectedPlan = [...formattedData].sort(
          (a, b) =>
            new Date(b.current_period_start).getTime() -
            new Date(a.current_period_start).getTime()
        )[0];

        if (latestSelectedPlan) {
          setCurrentPlan(latestSelectedPlan);
        }
      } catch (error) {
        console.error("Error fetching billing history:", error);
      }
    };

    fetchBilling();
  }, [userInfo?.sub]);

  console.log("subscribedPlan", subscribedPlan);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/" className="flex pl-0 justify-start h-full ">
                <img className="w-[90%]" src={logo} alt="" />
                {/* <span className="text-base font-semibold">VoicePeri</span> */}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full">
        {/* Navigation Content */}
        <div className="flex-grow">
          <NavMain items={data.navMain} />
          <hr />
          <NavSecondary items={data.navSecondary} />
        </div>

        {/* Payment Card at Bottom */}
        {user?.role == "user" && (
          <div className="mt-[100px]">
            <Card className="w-full bg-gradient-to-r !from-[#F3F0FF] !to-[#FFFFFF] p-4 !rounded-1 shadow-md border flex flex-col gap-[8px]">
              <CardContent className="flex flex-col gap-y-2 items-start justify-start p-0">
                <Button className="bg-gradient-to-r from-[#5223FF] to-[#8E70FF] text-secondary rounded-[5px] font-semibold text-sm rounded-1">
                  {currentPlan?.paymentPlan?.title}
                </Button>
                <p className="font-semibold text-lg text-black text-left">
                  {usedMinutes}/{totalMinutes} Minutes
                </p>
                <p className="text-default-gray text-sm font-medium text-left">
                  Remaining Minutes {RemainingMinutes}
                </p>
                <Progress
                  value={progressPercentage}
                  title={`${usedMinutes}/${totalMinutes} minutes`}
                  className="h-2 text-default-purple bg-gray-200"
                />
              </CardContent>
              <CardFooter className="mt-4 p-0">
                <Link to="/dashboard/settings#payment-plans">
                  <Button className="w-full text-lg rounded-[5px] font-medium bg-white text-black border border-gray-300 hover:bg-gray-100">
                    Add Payment
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </SidebarContent>

      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
