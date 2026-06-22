import { useEffect, useState } from "react";
import { SectionCards } from "@/components/section-cards";
import { LineChartComponent } from "@/components/LineChartComponent";
import { AreaChartComponent } from "@/components/AreaChartComponent";
import { BarChartMultiple } from "@/components/BarChartMultiple";
import { PiChart } from "@/components/PiChart";
import { HorizontalBarChart } from "@/components/HorizontalBarChart";
import { BarChartInteractive } from "@/components/BarChartInteractive";
import SentimentAnalysisCard from "@/components/SentimentAnalysisCard";
import { DaysSelector } from "@/components/days-selector";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { AppUser } from "@/AppContext";
const API_URL = import.meta.env.VITE_API_BASE_URL;
interface DecodedToken {
  firstname?: number;
  lastname?: string;
  email?: string;
  sub?: string;
  image?: string;
}

interface CallData {
  totalCallMinutes: {
    callMinutes: number;
    diff: number;
  };
  numberOfCalls: {
    totalCalls: number;
    diff: number;
  };
  totalCost: {
    Cost: number;
    diff: number;
  };
  averageCostPerCall: {
    averageCost: number;
    diff: number;
  };
  hangupReason: string[];
  userSentiments: string[];
  callDurationCategories: {
    longCalls: number;
    mediumCalls: number;
    shortCalls: number;
  };
}

const Overview = () => {
  const { user } = AppUser();
  const [createdAt, setCreatedAt] = useState("Last update : 12.02 pm");
  const [token, setToken] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState("7-days");
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [callData, setallData] = useState<CallData>({
    totalCallMinutes: {
      callMinutes: 0,
      diff: 0,
    },
    numberOfCalls: {
      totalCalls: 0,
      diff: 0,
    },
    totalCost: {
      Cost: 0,
      diff: 0,
    },
    averageCostPerCall: {
      averageCost: 0,
      diff: 0,
    },
    hangupReason: [],
    userSentiments: [],
    callDurationCategories: {
      longCalls: 0,
      mediumCalls: 0,
      shortCalls: 0,
    },
  });
  const [totalCostData, setTotalCostData] = useState([]);
  const [totalCallsData, setTotalCallsData] = useState([]);
  const [averageCostData, setAverageCostData] = useState([]);
  const [callMinutesData, setCallMinutesData] = useState([]);

  useEffect(() => {
    const fetchCreatedAt = async () => {
      try {
        const response = await axios.get(`${API_URL}api/logs/updated-time`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("reponse from logs ap i", response.data);
        setCreatedAt(response.data.createdAt);
      } catch (error) {
        console.error("Error fetching latest entry:", error);
      }
    };

    fetchCreatedAt(); // Only call if token is available
    console.log("inside token");
  }, []);
  useEffect(() => {
    const storedToken =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    setToken(storedToken);

    if (storedToken) {
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);

        setUserInfo(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();

      if (user?.role !== "admin" && userInfo?.sub) {
        params.append("user_id", userInfo?.sub);
      }

      if (selectedValue === "custom" && customStart && customEnd) {
        params.append("start", customStart.toISOString().split("T")[0]);
        params.append("end", customEnd.toISOString().split("T")[0]);
      } else {
        params.append("duration", selectedValue);
      }

      params.append("value", "total-cost"); // or "total-calls", etc.

      try {
        const res = await fetch(
          `${API_URL}api/call-history/overview-charts?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        console.log("what is the total cost of calls", data);
        setTotalCostData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userInfo?.sub && token) {
      fetchData();
    }
  }, [userInfo?.sub, token, selectedValue, customStart, customEnd]);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();

      if (user?.role !== "admin" && userInfo?.sub) {
        params.append("user_id", userInfo?.sub);
      }

      if (selectedValue === "custom" && customStart && customEnd) {
        params.append("start", customStart.toISOString().split("T")[0]);
        params.append("end", customEnd.toISOString().split("T")[0]);
      } else {
        params.append("duration", selectedValue);
      }

      params.append("value", "total-calls");
      try {
        const res = await fetch(
          `${API_URL}api/call-history/overview-charts?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        setTotalCallsData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userInfo?.sub && token) {
      fetchData();
    }
  }, [userInfo?.sub, token, selectedValue, customStart, customEnd]);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();

      if (user?.role !== "admin" && userInfo?.sub) {
        params.append("user_id", userInfo?.sub);
      }

      if (selectedValue === "custom" && customStart && customEnd) {
        params.append("start", customStart.toISOString().split("T")[0]);
        params.append("end", customEnd.toISOString().split("T")[0]);
      } else {
        params.append("duration", selectedValue);
      }
      params.append("value", "call-minutes");
      try {
        const res = await fetch(
          `${API_URL}api/call-history/overview-charts?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        setCallMinutesData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userInfo?.sub && token) {
      fetchData();
    }
  }, [userInfo?.sub, token, selectedValue, customStart, customEnd]);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();

      if (user?.role !== "admin" && userInfo?.sub) {
        params.append("user_id", userInfo?.sub);
      }

      if (selectedValue === "custom" && customStart && customEnd) {
        params.append("start", customStart.toISOString().split("T")[0]);
        params.append("end", customEnd.toISOString().split("T")[0]);
      } else {
        params.append("duration", selectedValue);
      }
      params.append("value", "average-cost");
      try {
        const res = await fetch(
          `${API_URL}api/call-history/overview-charts?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        console.log("what is the avg cost data of calls", data);
        setAverageCostData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userInfo?.sub && token) {
      fetchData();
    }
  }, [userInfo?.sub, token, selectedValue, customStart, customEnd]);
  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();

      if (user?.role !== "admin" && userInfo?.sub) {
        params.append("user_id", userInfo?.sub);
      }

      if (selectedValue === "custom" && customStart && customEnd) {
        params.append("start", customStart.toISOString().split("T")[0]);
        params.append("end", customEnd.toISOString().split("T")[0]);
      } else {
        params.append("duration", selectedValue);
      }
      try {
        const res = await fetch(
          `${API_URL}api/call-history/overview?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        setallData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userInfo?.sub && token) {
      fetchData();
    }
  }, [userInfo?.sub, token, selectedValue, customStart, customEnd]);

  // function handleRefreshData() {
  //   axios.get(`${API_URL}api/call-history/refresh`);
  // }

  return (
    <div>
      <div className="@container/main flex flex-1 flex-col gap-2 px-[16px]">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="md:flex justify-between ">
              <div className="flex flex-row md:flex-col items-center justify-between md:items-start mb-[10px] md:mb-0">
                <p className="text-[24px] font-[600]">Overview</p>
                <p className="text-[14px] font-[500]">{Date()}</p>
              </div>
              <div className="flex justify-between gap-[10px] items-center w-fit">
                <div className="w-[150px] w-fit">
                  <DaysSelector
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                    placeholder="Last 7 Days"
                    onCustomDateChange={(start, end) => {
                      setCustomStart(start);
                      setCustomEnd(end);
                    }}
                  />
                </div>
                <div
                  // onClick={handleRefreshData}
                  className="px-[10px] md:px-[20px] gap-[6px] md:gap-[10px] flex items-center bg-white rounded-[4px] shadow-sm h-[35px] border-[1px] border-gray-200"
                >
                  <p className=" text-[12px] md:text-[14px] font-[500]">
                    latest update :
                    {new Date(createdAt)
                      .toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(",", "")}
                  </p>
                  {/* <IconReload width={20} /> */}
                </div>
              </div>
            </div>
            <SectionCards callData={callData} />
            <div className=" grid grid-cols-1 md:grid-cols-2  gap-[20px] ">
              <LineChartComponent callMinutesData={callMinutesData} />
              <AreaChartComponent
                title="Number of calls"
                desc="Total number of calls made each day"
                totalChartData={totalCallsData}
                variant="blue"
              />
              <BarChartMultiple totalCostData={totalCostData} />
              <AreaChartComponent
                title="Average cost per call"
                desc="The avg cost per call made by each day"
                totalChartData={averageCostData}
                variant="purple"
              />
              {/* <ChartAreaInteractive /> */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] ">
              <div className="h-full ">
                <PiChart data={callData?.hangupReason} />
              </div>
              <div className="h-full ">
                <HorizontalBarChart data={callData?.callDurationCategories} />
              </div>
              <div className="h-full ">
                <SentimentAnalysisCard data={callData?.userSentiments} />
              </div>
            </div>

            <div className=" max-w-full grid grid-cols-1  gap-[20px] ">
              <BarChartInteractive />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
