import { useEffect, useState } from "react";
import HashtagInput from "@/components/HashtagInput";
import StatusInput from "@/components/StatusInput";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import VoiceAgentSettings from "@/components/VoiceAgentSettings";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import { ComboboxDemo } from "@/components/timezone-selector";
import { MapPin, Building2, Sliders, Briefcase, Clock, Save, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const translatedMap: Record<string, string> = {
  es: "24 horas",
  fr: "24 heures",
  de: "24 Stunden",
  ar: "٢٤ ساعة",
  en: "24 hours",
  ru: "24 часа",
  zh: "24小时",
};

type Language = {
  id: string;
  name: string;
  locale: string;
  [key: string]: any;
  status: boolean;
};

interface DecodedToken {
  firstname?: string;
  email?: string;
  sub?: string;
}
// interface Voice {
//     provider: string;
//     voice_id: string;
//     [key: string]: any;
// }
interface AgentInfo {
  language?: {
    code: string; // like 'en', 'es', etc.
  };
  // add other fields if needed
}

const normalizeBusinessHours = (hours?: string[]): string[] => {
  if (!hours || !Array.isArray(hours) || hours.length === 0) return [];
  const hasConsolidated = hours.some(h =>
    h.includes("Monday - Friday") || h.includes("Available") || h.includes("Mon - Fri") || h.includes("Mon-Fri")
  );
  if (hasConsolidated) {
    return [
      "Monday: 8:00 AM - 6:00 PM",
      "Tuesday: 8:00 AM - 6:00 PM",
      "Wednesday: 8:00 AM - 6:00 PM",
      "Thursday: 8:00 AM - 6:00 PM",
      "Friday: 8:00 AM - 6:00 PM",
      "Saturday: Closed",
      "Sunday: Closed",
    ];
  }
  return hours;
};

const VoiceAgent: React.FC = () => {
  const location = useLocation();
  const [showForm1, setShowForm1] = useState(!location.pathname.includes("voiceAgent"));

  useEffect(() => {
    if (location.pathname.includes("voiceAgent")) {
      setShowForm1(false);
    } else if (location.pathname.includes("businessInformation")) {
      setShowForm1(true);
    }
  }, [location.pathname]);

  const [voices, setVoices] = useState<any>(null);
  const [languages, setLanguages] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [businessInfo2, setBusinessInfo2] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("America/Detroit");
  const [overview, setOverview] = useState("");
  const [profile, setProfile] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentInfo, setagentInfo] = useState<AgentInfo | null>(null);

  const [locationData, setLocationData] = useState<{ description: string }[]>(
    []
  );
  const [weekdays, setWeekdays] = useState<string[]>([]);

  const [businessHours, setBusinessHours] = useState<
    Record<string, { from: string; to: string } | null>
  >(weekdays.reduce((acc, day) => ({ ...acc, [day]: null }), {}));
  const [initialBusinessHours, setInitialBusinessHours] = useState<
    Record<string, { from: string; to: string } | null>
  >(weekdays.reduce((acc, day) => ({ ...acc, [day]: null }), {}));

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  console.log("agentInfo", agentInfo);
  console.log("businessInfo", businessInfo);

  const langCode = agentInfo?.language?.code || "en";
  const translation = translatedMap[langCode] || translatedMap["en"];

  useEffect(() => {
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);

        setUserInfo(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, [token]);

  const convertTo24Hour = (time: string): string => {
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [h, m] = time.split(":");
      return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    }

    // Handle 12-hour formats like "12:00 PM" or "8:30 AM"
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return "";

    const [_, h, m, meridian] = match;
    let hours = parseInt(h);
    const minutes = m?.padStart(2, "0");

    if (meridian?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (meridian?.toUpperCase() === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await fetch(`${API_URL}api/agents/languages`);
        const res2 = await fetch(`${API_URL}api/agents/voices`);
        const res3 = await fetch(`${API_URL}api/agents/${userInfo?.sub}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res3.ok) {
          const json3 = await res3.json();
          setagentInfo(json3);
        } else {
          setagentInfo(null);
        }
        const infoRes = await fetch(
          `${API_URL}api/businessinfos/${userInfo?.sub}`, {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const languagesData = (await res1.json()).filter(
          (lang: Language) => lang.status === true
        );

        const voicesData = await res2.json();
        const businessData = await infoRes.json();
        const filteredVoices = voicesData.filter(
          (voice: any) =>
            voice.provider === "elevenlabs" &&
            [
              "11labs-Andrew",
              "11labs-Steve",
              "11labs-Paul",
              "11labs-Chloe",
              "11labs-Marissa",
              "11labs-Gilfoy",
              "11labs-Zuri",
              "11labs-Brian",
              "11labs-Santiago",
              "11labs-Susan",
              "11labs-Evie",
              "11labs-Paola",
            ].includes(voice.voice_id)
        );
        setLanguages(languagesData);
        setVoices(filteredVoices);
        setBusinessInfo(businessData);
        setBusinessInfo2(businessData);
        setName(businessData?.name);
        setAddress(businessData?.address);
        setPhone(businessData?.phone);
        setOverview(businessData?.overview);
        setServices(businessData?.services);
        setTimezone(businessData?.timezone || "America/Detroit");
        // setProfile(businessData?.profile)

        interface BusinessData {
          name?: string;
          address?: string;
          phone?: string;
          overview?: string;
          services?: string[];
          timezone?: string;
          profile?: string;
          business_hours?: string[];
          week_days?: Record<string, { from: string; to: string }>;
          id?: string;
          [key: string]: any;
        }

        interface WeekdayObject {
          [key: string]: string;
        }

        const rawHours = normalizeBusinessHours((businessData as BusinessData)?.business_hours);
        const weekdayObject: WeekdayObject =
          rawHours.reduce(
            (acc: WeekdayObject, entry: string) => {
              const [day, times] = entry
                .split(":")
                .map((s: string) => s.trim());
              acc[day] = times;
              return acc;
            },
            {} as WeekdayObject
          ) || {};

        // Extract keys
        const weekdayKeys = Object.keys(weekdayObject);
        setWeekdays(weekdayKeys.length > 0 ? weekdayKeys : DEFAULT_WEEKDAYS);

        const parsedHours = weekdayKeys?.reduce((acc, day) => {
          const legacyEntry = rawHours.find((h: string) =>
            h.startsWith(day)
          );
          // const modernEntry = businessData.week_days?.[day];

          if (legacyEntry) {
            // Handles 'Open 24 hours'
            if (
              legacyEntry.includes("Open 24 hours") ||
              legacyEntry.includes("24")
            ) {
              acc[day] = {
                from: "00:00",
                to: "00:00",
              };
            } else {
              const match = legacyEntry.match(/: (.+?)\s*[–—-]\s*(.+)$/);
              if (match) {
                acc[day] = {
                  from: convertTo24Hour(match[1]),
                  to: convertTo24Hour(match[2]),
                };
              } else {
                acc[day] = null;
              }
            }
          }

          return acc;
        }, {} as Record<string, { from: string; to: string } | null>);

        setBusinessHours(parsedHours);
        setInitialBusinessHours(parsedHours);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (userInfo?.sub) {
      fetchData();
    }
  }, [userInfo?.sub, API_URL]);

  const toggleHours = (day: string, checked: boolean) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: checked
        ? { from: "00:00", to: "00:00" } // Open 24 hours
        : { from: "", to: "" }, // Reset
    }));
  };
  const toggleDay = (day: string) => {
    setBusinessHours((prev) => {
      const isCurrentlyInactive = !prev[day];
      return {
        ...prev,
        [day]: isCurrentlyInactive
          ? initialBusinessHours[day] || { from: "", to: "" }
          : null,
      };
    });
  };

  // const convertBusinessHoursToLegacyFormat = (
  //     hours: Record<string, { from: string; to: string } | null>
  // ): string[] => {
  //     return Object.entries(hours).map(([day, time]) => {
  //         if (time && time.from && time.to) {
  //             return `${day}: ${time.from} – ${time.to}`;
  //         } else {
  //             return `${day}: ${null}`;
  //         }
  //     });
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // const formattedBusinessHours = convertBusinessHoursToLegacyFormat(businessHours);
    setLoading(true);
    const formattedBusinessHours: string[] = [];

    function convertToAmPm(time: string) {
      if (!time) return "";
      const [hourStr, minuteStr] = time.split(":");
      let hour = parseInt(hourStr, 10);
      const minute = minuteStr;
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12; // convert 0 to 12 for 12 AM
      return `${hour}:${minute} ${ampm}`;
    }

    weekdays.forEach((day) => {
      const from = businessHours[day]?.from || "";
      const to = businessHours[day]?.to || "";

      if ((from === to && from && to) || (from === "00:00" && to === "00:00")) {
        formattedBusinessHours.push(`${day}: Open 24 hours`);
      } else if (from && to) {
        formattedBusinessHours.push(
          `${day}: ${convertToAmPm(from)} - ${convertToAmPm(to)}`
        );
      } else {
        formattedBusinessHours.push(`${day}:`); // Optional
      }
    });

    const payload = {
      name,
      address,
      phone,
      overview,
      services,
      business_hours: formattedBusinessHours,
      timezone,
      profile,
    };

    try {
      let res;
      if (businessInfo2 && businessInfo2.id) {
        res = await fetch(
          `${API_URL}api/businessinfos/${businessInfo2.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`${API_URL}api/businessinfos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, user_id: userInfo?.sub }),
        });
      }

      if (!res.ok) throw new Error("Failed to update business info");
      try {
        await handleUpdateLlm(e);
      } catch (llmError) {
        console.log("LLM Update skipped or failed (likely no agent exists yet)");
      }
      setLoading(false);
      toast.success("Business info updated successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong while saving.");
      setLoading(false);
    }
  };
  const handleUpdateLlm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo) {
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}api/agents/update-llm/${userInfo?.sub}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to update llm");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  async function handleCompleteLocation(url: string) {
    if (url.length > 3) {
      try {
        const response = await fetch(
          `${API_URL}api/places/autocomplete?input=${encodeURIComponent(url)}`
        );
        const data = await response.json();
        setLocationData(data.predictions || []);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    } else if (url.length < 3) {
      setLocationData([]);
    }
  }
  const handleBusinessInfo = async (userId?: string, customQuery?: string) => {
    // const selectedLanguage = languages?.find((lang) => lang.id == step1Data.language);
    const searchQuery = customQuery || profile;
    if (!searchQuery || !searchQuery.trim()) {
      toast.error("Please enter a website URL, business name, or address first.");
      return;
    }

    try {
      toast.loading("Autofilling business information...", { id: "autofill-toast" });
      const response = await fetch(`${API_URL}api/businessinfos/new-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          query: searchQuery,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Business info creation failed");
      }

      const data = await response.json();
      setBusinessInfo(data);
      if (data?.name) setName(data.name);
      if (data?.formatted_address) setAddress(data.formatted_address);
      if (data?.international_phone_number) setPhone(data.international_phone_number);
      setOverview(data?.overview || data?.editorial_summary?.overview || "");

      toast.success("Business information autofilled successfully!", { id: "autofill-toast" });
      const filteredServices = (data?.types || []).filter(
        (type: string) =>
          type !== "point_of_interest" && type !== "establishment"
      );
      setServices(filteredServices);
      interface BusinessData {
        name?: string;
        address?: string;
        phone?: string;
        overview?: string;
        services?: string[];
        timezone?: string;
        profile?: string;
        business_hours?: string[];
        week_days?: Record<string, { from: string; to: string }>;
        id?: string;
        [key: string]: any;
      }

      interface WeekdayObject {
        [key: string]: string;
      }

      const rawFetchedHours = normalizeBusinessHours((data as BusinessData)?.opening_hours?.weekday_text || (data as BusinessData)?.business_hours);
      const weekdayObject: WeekdayObject =
        rawFetchedHours.reduce(
          (acc: WeekdayObject, entry: string) => {
            const [day, times] = entry.split(":").map((s: string) => s.trim());
            acc[day] = times;
            return acc;
          },
          {} as WeekdayObject
        ) || {};

      // Extract keys
      const weekdayKeys = Object.keys(weekdayObject);
      setWeekdays(weekdayKeys.length > 0 ? weekdayKeys : DEFAULT_WEEKDAYS);

      const parsedHours = weekdayKeys?.reduce((acc, day) => {
        const legacyEntry = rawFetchedHours.find(
          (h: string) => h.startsWith(day)
        );
        // const modernEntry = data.week_days?.[day];

        if (legacyEntry) {
          // Handles 'Open 24 hours'
          if (
            legacyEntry.includes("Open 24 hours") ||
            legacyEntry.includes("24")
          ) {
            acc[day] = {
              from: "00:00",
              to: "00:00",
            };
          } else {
            const match = legacyEntry.match(/: (.+?)\s*[–—-]\s*(.+)$/);
            if (match) {
              acc[day] = {
                from: convertTo24Hour(match[1]),
                to: convertTo24Hour(match[2]),
              };
            } else {
              acc[day] = null;
            }
          }
        }

        return acc;
      }, {} as Record<string, { from: string; to: string } | null>);

      setBusinessHours(parsedHours);
      setInitialBusinessHours(parsedHours);
    } catch (error: any) {
      console.error("Business Info Error:", error);
    }
  };
  const businessInfovoice = `${name} is located at ${address}. You can reach us at ${phone}.`;
  return (
    <div className="pb-12 bg-slate-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-3 p-1.5 bg-slate-200/60 backdrop-blur-md rounded-2xl w-fit mb-8 shadow-inner border border-slate-300/40">
          <button
            type="button"
            onClick={() => {
              setShowForm1(true);
              navigate("/dashboard/businessInformation");
            }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 cursor-pointer ${
              showForm1
                ? "bg-[#1c9c84] text-white shadow-md shadow-teal-500/20 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Building2 className="w-4 h-4 md:w-5 md:h-5" />
            Business Information
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm1(false);
              navigate("/dashboard/voiceAgent");
            }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 cursor-pointer ${
              !showForm1
                ? "bg-[#1c9c84] text-white shadow-md shadow-teal-500/20 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Sliders className="w-4 h-4 md:w-5 md:h-5" />
            Voice Agent Settings
          </button>
        </div>

        <form className={`mt-2 ${showForm1 ? "flex" : "hidden"} flex-col gap-8`}>
          {/* Company Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-lg shadow-slate-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-slate-100">
              <div className="p-3 bg-teal-50 rounded-xl text-[#1c9c84] border border-teal-100/60">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">General Company Profile</h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">Configure core details so your AI Voice Agent represents your business brand accurately.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col items-start">
                <label
                  htmlFor="profile"
                  className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"
                >
                  Search Business Information (or enter website URL)
                </label>
                <div className="flex w-full gap-2 items-center">
                  <Input
                    value={profile}
                    onChange={(e) => {
                      setProfile(e.target.value);
                      handleCompleteLocation(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setLocationData([]);
                        handleBusinessInfo(userInfo?.sub, e.currentTarget.value);
                      }
                    }}
                    id="profile"
                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] transition-all duration-200 rounded-xl text-slate-800 placeholder:text-slate-400"
                    placeholder="Enter business name or website (e.g. printez.com)"
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLocationData([]);
                      handleBusinessInfo(userInfo?.sub, profile);
                    }}
                    className="h-11 px-4 bg-[#1c9c84] hover:bg-[#16806c] text-white rounded-xl font-semibold shadow-md transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Autofill</span>
                  </Button>
                </div>
                <div
                  className={`${
                    locationData?.length !== 0 ? "flex" : "hidden"
                  } scrollbar-hide bg-white border border-slate-200 shadow-xl rounded-xl h-fit max-h-[160px] py-2 px-1.5 w-full mt-1.5 max-w-full flex-col overflow-x-hidden z-20`}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {locationData?.map((item, index) => (
                    <div
                      onClick={() => {
                        setProfile(item.description);
                        setLocationData([]);
                        handleBusinessInfo(userInfo?.sub, item.description);
                      }}
                      key={index}
                      className="w-full mt-1 px-3 py-2 rounded-lg cursor-pointer text-xs sm:text-sm font-medium hover:bg-teal-50 text-slate-700 hover:text-[#1c9c84] transition-colors"
                    >
                      <span className="flex w-full items-center gap-2.5 whitespace-nowrap overflow-x-auto no-scrollbar">
                        <span className="min-w-[18px] text-[#1c9c84]">
                          <MapPin width={15} height={15} />
                        </span>
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-700 mb-2"
                >
                  Business Name
                </label>
                <Input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  id="name"
                  className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] transition-all duration-200 rounded-xl text-slate-800 placeholder:text-slate-400"
                  placeholder="e.g. PrintEZ"
                />
              </div>

              <div className="flex flex-col items-start">
                <label
                  htmlFor="address"
                  className="text-sm font-semibold text-slate-700 mb-2"
                >
                  Business Address
                </label>
                <Input
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                  id="address"
                  className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] transition-all duration-200 rounded-xl text-slate-800 placeholder:text-slate-400"
                  placeholder="3377 Wilshire Blvd #202, Los Angeles, CA 90010"
                />
              </div>

              <div className="flex flex-col items-start">
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold text-slate-700 mb-2"
                >
                  Business Phone Number
                </label>
                <Input
                  onChange={(e) => setPhone(e.target.value)}
                  value={phone}
                  id="phone"
                  className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] transition-all duration-200 rounded-xl text-slate-800 placeholder:text-slate-400"
                  placeholder="+1 800-555-0199"
                />
              </div>

              <div className="flex flex-col items-start">
                <label
                  htmlFor="overview"
                  className="text-sm font-semibold text-slate-700 mb-2"
                >
                  Business Overview & Background
                </label>
                <Textarea
                  onChange={(e) => setOverview(e.target.value)}
                  value={overview}
                  id="overview"
                  className="resize-none w-full h-[200px] bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] rounded-xl p-3.5 text-slate-800 transition-all duration-200 text-sm placeholder:text-slate-400 leading-relaxed"
                  placeholder="Describe your primary services, company mission, policies, and special instructions..."
                />
              </div>

              <div className="flex flex-col items-start w-full">
                <label
                  htmlFor="services"
                  className="text-sm font-semibold text-slate-700 mb-2"
                >
                  Services Offered
                </label>
                <div className="w-full">
                  <HashtagInput services={services} setServices={setServices} />
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-lg shadow-slate-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/60">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Operating Hours & Schedule</h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">Manage daily availability and timezone settings for appointments and consultations.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200/60 min-w-[280px]">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider px-2">Zone:</span>
                <div className="flex-1">
                  <ComboboxDemo
                    timezone={timezone}
                    setTimezone={setTimezone}
                    placeholder="Select timezone"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-1 sm:grid-cols-4 items-center p-3 sm:p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all duration-200 gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <Switch
                      checked={!!businessHours[day]}
                      onCheckedChange={() => toggleDay(day)}
                      className="data-[state=checked]:bg-[#1c9c84] cursor-pointer shadow-sm"
                    />
                    <label className="text-sm sm:text-base font-bold text-slate-700 w-28">
                      {day}
                    </label>
                  </div>

                  {businessHours[day] ? (
                    <>
                      <div className="flex items-center justify-between px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl h-11 shadow-inner">
                        <label
                          className={`text-xs font-bold uppercase tracking-wider ${
                            businessHours[day]?.from === "00:00" &&
                            businessHours[day]?.to === "00:00"
                              ? "text-slate-400"
                              : "text-[#1c9c84]"
                          }`}
                          htmlFor={`${day}-from`}
                        >
                          From
                        </label>
                        <Input
                          className="appearance-none w-32 border-none bg-transparent shadow-none px-2 py-1 font-semibold text-slate-800 text-sm text-right focus:outline-none cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none"
                          id={`${day}-from`}
                          type="time"
                          disabled={
                            businessHours[day]?.from === "00:00" &&
                            businessHours[day]?.to === "00:00"
                          }
                          value={businessHours[day]?.from || ""}
                          onChange={(e) => {
                            setBusinessHours((prev) => {
                              const dayData = prev[day] || { from: "", to: "" };
                              return {
                                ...prev,
                                [day]: {
                                  ...dayData,
                                  from: e.target.value,
                                },
                              };
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl h-11 shadow-inner">
                        <label
                          className={`text-xs font-bold uppercase tracking-wider ${
                            businessHours[day]?.from === "00:00" &&
                            businessHours[day]?.to === "00:00"
                              ? "text-slate-400"
                              : "text-[#1c9c84]"
                          }`}
                          htmlFor={`${day}-to`}
                        >
                          To
                        </label>
                        <Input
                          className="appearance-none w-32 border-none bg-transparent shadow-none px-2 py-1 font-semibold text-slate-800 text-sm text-right focus:outline-none cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none"
                          id={`${day}-to`}
                          type="time"
                          value={businessHours[day]?.to || ""}
                          disabled={
                            businessHours[day]?.from === "00:00" &&
                            businessHours[day]?.to === "00:00"
                          }
                          onChange={(e) => {
                            setBusinessHours((prev) => {
                              const dayData = prev[day] || { from: "", to: "" };
                              return {
                                ...prev,
                                [day]: {
                                  ...dayData,
                                  to: e.target.value,
                                },
                              };
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-3 justify-end sm:justify-center">
                        <Switch
                          checked={
                            businessHours[day]?.from === "00:00" &&
                            businessHours[day]?.to === "00:00"
                          }
                          onCheckedChange={(checked) =>
                            toggleHours(day, checked)
                          }
                          className="data-[state=checked]:bg-blue-600 cursor-pointer shadow-sm"
                        />
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {translation}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-1 sm:col-span-3 flex justify-start sm:justify-center">
                      <div className="bg-slate-100/80 border border-slate-200/60 rounded-xl px-4 py-1.5 w-full max-w-[320px] flex items-center justify-center">
                        <StatusInput />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Floating Save Bar */}
          <div className="sticky bottom-6 z-30 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200/80 shadow-2xl flex items-center justify-between gap-4 mt-4">
            <span className="text-xs sm:text-sm font-medium text-slate-500 hidden sm:inline-block">
              Remember to save your business details to apply changes across active agents.
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => navigate("/dashboard")}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <Button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e)}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div role="status" className="flex items-center gap-2">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-blue-200 animate-spin fill-white"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className={`${showForm1 ? "hidden" : "block"}`}>
          <VoiceAgentSettings
            languages={languages}
            voices={voices}
            businessInfovoice={businessInfovoice}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
