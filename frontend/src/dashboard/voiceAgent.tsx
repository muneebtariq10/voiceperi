import { useEffect, useState } from "react";
import HashtagInput from "@/components/HashtagInput";
import StatusInput from "@/components/StatusInput";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import VoiceAgentSettings from "@/components/VoiceAgentSettings";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { ComboboxDemo } from "@/components/timezone-selector";
import { MapPin } from "lucide-react";
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
const VoiceAgent: React.FC = () => {
  const [voices, setVoices] = useState<any>(null);
  const [languages, setLanguages] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [businessInfo2, setBusinessInfo2] = useState<any>(null);
  const [showForm1, setShowForm1] = useState(true);
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
  }, []);

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
        const res3 = await fetch(`${API_URL}api/agents/${userInfo?.sub}`);
        const json3 = await res3.json();
        setagentInfo(json3);
        const infoRes = await fetch(
          `${API_URL}api/businessinfos/${userInfo?.sub}`
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

        const weekdayObject: WeekdayObject =
          (businessData as BusinessData)?.business_hours?.reduce(
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
          const legacyEntry = businessData.business_hours?.find((h: string) =>
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
  }, [userInfo?.sub]);

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
      const res = await fetch(
        `${API_URL}api/businessinfos/${businessInfo2.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update business info");
      await handleUpdateLlm(e);
      setLoading(false);
      toast.success("Business info updated successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast("Something went wrong while saving.");
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
  const handleBusinessInfo = async (userId?: string) => {
    // const selectedLanguage = languages?.find((lang) => lang.id == step1Data.language);

    try {
      const response = await fetch(`${API_URL}api/businessinfos/new-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          query: profile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Business info creation failed");
      }

      const data = await response.json();
      setBusinessInfo(data);
      setName(data?.name);
      setAddress(data?.formatted_address || "");
      setPhone(data?.international_phone_number || "");
      setOverview(data?.editorial_summary?.overview || "");

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

      const weekdayObject: WeekdayObject =
        (data as BusinessData)?.opening_hours?.weekday_text?.reduce(
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
        const legacyEntry = data.opening_hours?.weekday_text?.find(
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
            const match = legacyEntry.match(/: (.+?)\s*–\s*(.+)$/);
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
    <div>
      <div className="px-[20px]">
        <div className="flex border-b border-gray-200 mt-[20px] gap-[30px] text-[14px] md:text-[24px] font-[600]">
          <div className="p-2 pb-0 cursor-pointer">
            <p
              className={`${showForm1 ? "text-[#5222FF]" : "text-[black]"} ${
                showForm1 ? "border-b-[3px]" : "border-b-0"
              } border-[#5222FF] px-[5px]`}
              onClick={() => {
                setShowForm1(true);
              }}
            >
              Business Information
            </p>
          </div>
          <div className="p-2 pb-0 cursor-pointer">
            <p
              className={`${!showForm1 ? "text-[#5222FF]" : "text-black"} ${
                !showForm1 ? "border-b-[3px]" : "border-b-0"
              } border-[#5222FF] px-[5px]`}
              onClick={() => {
                setShowForm1(false);
              }}
            >
              Voice Agent Settings
            </p>
          </div>
        </div>

        <form className={`mt-[30px] ${showForm1 ? "flex" : "hidden"} flex-col`}>
          <div className="grid grid-cols-1 md:grid-cols-2 w-full md:w-[75%] py-5 gap-x-[80px] gap-y-[30px]">
            <div className="flex flex-col items-start">
              <label
                htmlFor="profile"
                className="text-[16px] md:text-[20px] font-[600] mb-[7px]"
              >
                Search Business Information
              </label>
              <Input
                value={profile}
                onChange={(e) => {
                  setProfile(e.target.value);
                  handleCompleteLocation(e.target.value);
                }}
                id="profile"
                placeholder="Enter your business name & address or website"
              />
              <div
                className={`${
                  locationData?.length !== 0 ? "flex" : "hidden"
                } scrollbar-hide bg-gray-100 rounded-[3px] h-fit max-h-[150px] py-[5px] px-1 w-full mt-[4px] max-w-full flex items-start flex-col overflow-x-hidden`}
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
                      handleBusinessInfo(userInfo?.sub);
                    }}
                    style={{
                      scrollbarWidth: "none" /* For Firefox */,
                      msOverflowStyle: "none" /* For Internet Explorer 10+ */,
                    }}
                    key={index}
                    className="w-full mt-[2px] rounded-[3px] cursor-pointer text-[12px] scroll-auto h-[20px] hover:bg-gray-200"
                  >
                    <span
                      style={{
                        scrollbarWidth: "none" /* For Firefox */,
                        msOverflowStyle: "none" /* For Internet Explorer 10+ */,
                      }}
                      className="flex w-full items-center gap-[10px] whitespace-nowrap overflow-x-auto no-scrollbar"
                    >
                      <span className="min-w-[20px]">
                        <MapPin width={14} height={12} />
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
                className="text-[16px] md:text-[20px] font-[600] mb-[7px]"
              >
                Business Name
              </label>
              <Input
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
                id="name"
                placeholder="Business Name"
              />
            </div>
            <div className="flex flex-col items-start">
              <label
                htmlFor="address"
                className="text-[16px] md:text-[20px] font-[600] mb-[7px]"
              >
                Address
              </label>
              <Input
                onChange={(e) => {
                  setAddress(e.target.value);
                }}
                value={address}
                id="address"
                placeholder="3377 Wilshire Blvd #202, Los Angeles, 90010, California"
              />
            </div>
            <div className="flex flex-col items-start">
              <label
                htmlFor="phone"
                className="text-[16px] md:text-[20px] font-[600] mb-[7px]"
              >
                Business Phone Number
              </label>
              <Input
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
                value={phone}
                id="phone"
                placeholder="+91 15484613151"
              />
            </div>
            <div className="flex flex-col items-start">
              <label
                htmlFor="overview"
                className="text-[16px] md:text-[20px] font-[600] mb-[7px]"
              >
                Business Overview
              </label>
              <Textarea
                onChange={(e) => {
                  setOverview(e.target.value);
                }}
                value={overview}
                id="overview"
                className="resize-none w-full h-[200px] border-[1px] border-gray-200 rounded-[8px] p-[10px]"
                placeholder="Business Overview"
              />
            </div>
            <div className="flex flex-col items-start">
              <label
                htmlFor="services"
                className="text-[16px] md:text-[20px] font-[600] mb-[7px]"
              >
                Services Offered
              </label>
              <HashtagInput services={services} setServices={setServices} />
            </div>
          </div>
          <div className=" w-[100%] md:w-[80%]">
            <h1 className="text-[20px] font-[600] text-start my-[10px]">
              Business Hours
            </h1>
            <div className="grid grid-cols-4 gap-[30px] items-center mb-[40px] ">
              <p className="text-[18px] justify-self-start font-[500]">
                Timezone
              </p>
              <div className="col-span-2">
                <ComboboxDemo
                  timezone={timezone}
                  setTimezone={setTimezone}
                  placeholder="Select timezone"
                />
              </div>
            </div>
            <div className="flex flex-col gap-[20px]">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-4 gap-y-[40px] gap-x-[30px]"
                >
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={!!businessHours[day]}
                      onCheckedChange={() => toggleDay(day)}
                      className="data-[state=checked]:bg-blue-500 cursor-pointer"
                    />
                    <label className="text-[14px] md:text-[18px] font-[500]">
                      {day}
                    </label>
                  </div>
                  {businessHours[day] ? (
                    <>
                      <div className="flex items-center justify-center px-[5px] border-[1px] border-gray-200 rounded-[8px] justify-between h-[45px]">
                        <label
                          className={`${
                            businessHours[day]?.from === "00:00" &&
                            businessHours[day]?.to === "00:00"
                              ? "text-[#adadad]"
                              : "text-black"
                          }`}
                          htmlFor={`${day}-from`}
                        >
                          From
                        </label>
                        <Input
                          className="appearance-none w-[70%] border-none shadow-none px-3 py-2 rounded-md text-center focus:outline-none border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none"
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
                      <div className="flex items-center justify-center px-[5px] border-[1px] border-gray-200 rounded-[8px] justify-between h-[45px]">
                        <label
                          className={`${
                            businessHours[day]?.from === "00:00" &&
                            businessHours[day]?.to === "00:00"
                              ? "text-[#adadad]"
                              : "text-black"
                          }`}
                          htmlFor={`${day}-to`}
                        >
                          To
                        </label>
                        <Input
                          className="appearance-none w-[70%] border-none shadow-none px-3 py-2 rounded-md text-center focus:outline-none border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none"
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
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={
                            businessHours[day]?.from === "00:00" &&
                            businessHours[day]?.to === "00:00"
                          }
                          onCheckedChange={(checked) =>
                            toggleHours(day, checked)
                          }
                          className="data-[state=checked]:bg-blue-500 cursor-pointer"
                        />

                        <label className="text-[14px] md:text-[18px] font-[500]">
                          {translation}
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 flex justify-center">
                      <StatusInput />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="my-[40px] flex justify-end gap-[20px]">
            <button
              onClick={() => {
                navigate("/dashboard");
              }}
              type="button"
              className="w-[175px] h-[50px] rounded-[8px] border-[1px] border-[#5222FF] text-[#5222FF] cursor-pointer hover:bg-[#5222FF] hover:text-white "
            >
              Cancel
            </button>
            <Button
              type="button"
              disabled={loading}
              onClick={(e) => {
                handleSubmit(e);
              }}
              className="w-[175px] h-[50px] rounded-[8px] border-[1px] border-[#5222FF] text-[white] bg-[#5222FF] hover:bg-[#3822ff] cursor-pointer"
            >
              {loading ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-[28px] h-[28px] text-gray-600 animate-spin fill-[#fff]"
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
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                "Save"
              )}
            </Button>
            {/* <button
                            onClick={handleSubmit}
                            className="w-[175px] h-[50px] rounded-[8px] border-[1px] border-[#5222FF] text-[white] bg-[#5222FF]"
                        >
                            Save
                        </button> */}
          </div>
        </form>
        <div className={`${showForm1 ? "hidden" : "flex"}`}>
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
