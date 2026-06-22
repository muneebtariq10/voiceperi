import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import info_icon from "../assets/info_icon.svg";
import TooltipWrapper from "./TooltipWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import AudioPlayer1 from "./audio1";

type Step1Data = {
  name: string;
  email: string;
  confirm: boolean;
  agentName: string;
  language: string;
  voice_tone: string;
  url: string;
};

type Step1Props = {
  step1Data: Step1Data;
  setStep1Data: React.Dispatch<React.SetStateAction<Step1Data>>;
  errors: Partial<Record<keyof Step1Data, boolean>>;
  setErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof Step1Data, boolean>>>
  >;
  voices: Voice[] | null;
  languages: Language[] | null;
  handleGoogleLogin: () => void;
};
export type Language = {
  id: string;
  name: string;
  locale: string;
  code: string;
};

export type Voice = {
  voice_id: string;
  voice_name: string;
  preview_audio_url: string;
  language: string;
  age: string; // Add the missing 'age' property
  gender: string; // Add 'gender' if not already defined
  accent: string; // Add 'accent' if not already defined
};

export const Step1 = ({
  step1Data,
  setStep1Data,
  errors,
  setErrors,
  voices,
  languages,
}: Step1Props) => {
  console.log("step1Data", step1Data);
  const [locationData, setLocationData] = useState<{ description: string }[]>(
    []
  );

  const API_URL = import.meta.env.VITE_API_BASE_URL;
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
  const [languageCode, setLanguageCode] = useState("");
  useEffect(() => {
    if (languages && languages.length > 0 && step1Data?.language) {
      const selectedLanguage = languages.find(
        (lang) => lang.id === step1Data.language
      );
      if (selectedLanguage) {
        setLanguageCode(selectedLanguage.code);
      }
    }
  }, [languages, step1Data?.language]);
  // useEffect(() => {
  //   // Reset voice_tone when language changes
  //   setStep1Data((prev) => ({ ...prev, voice_tone: "" }));
  // }, [languageCode]);
  console.log("language", languages);
  //console.log("selected language", step1Data?.language);
  console.log("language code", languageCode);
  console.log("selected voice", step1Data?.voice_tone);
  return (
    <>
      <div className="flex flex-col items-left text-left">
        <h1 className="text-[38px] font-bold">Voice Agent Setup</h1>
        <p className="text-muted-foreground text-balance">
          Fill the required details to setup
        </p>
      </div>
      <form action="">
        <div className="grid gap-3 mt-3">
          <Label
            htmlFor="text"
            className={` ${errors.agentName ? "text-red-500" : ""}`}
          >
            Agent Name*
          </Label>
          <Input
            className={` ${errors.agentName ? "border-red-500" : ""}`}
            id="name"
            type="text"
            value={step1Data?.agentName}
            onChange={(e) => {
              setStep1Data({ ...step1Data, agentName: e.target.value });
              if (errors.agentName) {
                setErrors((prev) => ({ ...prev, agentName: false }));
              }
            }}
            placeholder="John Adams"
            required
          />
        </div>
        <div className="grid gap-3 mt-3">
          <Label
            htmlFor="text"
            className={` ${errors.language ? "text-red-500" : ""}`}
          >
            Language*{" "}
            <TooltipWrapper tooltipText="Select The Language of Your Agent">
              <span className="ml-1">
                <img src={info_icon} alt="" />
              </span>
            </TooltipWrapper>
          </Label>
          <Select
            value={step1Data?.language}
            onValueChange={(value) => {
              setStep1Data((prev) => ({
                ...prev,
                language: value,
                voice_tone: "", // ✅ reset voice tone only on actual user interaction
              }));
              if (errors.language) {
                setErrors((prev) => ({ ...prev, language: false }));
              }
            }}
            required
          >
            <SelectTrigger
              className={`w-full  ${errors.language ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages?.map((language) => {
                // Extract country code from locale like 'en-US' -> 'us'
                const countryCode = language.locale
                  ?.split("-")?.[1]
                  ?.toLowerCase();

                return (
                  <SelectItem key={language.id} value={language.id}>
                    <div className="flex items-center gap-2">
                      {countryCode && (
                        <img
                          src={`https://flagcdn.com/w40/${countryCode}.png`}
                          alt={language.name}
                          className="w-5 h-4 object-cover rounded-sm"
                        />
                      )}
                      <span>{language.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3">
          <div className="flex items-end justify-between">
            <div className="grid gap-3 mt-3 w-[85%]">
              <Label
                htmlFor="text"
                className={` ${errors.voice_tone ? "text-red-500" : ""}`}
              >
                Voice & Tone*
              </Label>
              <Select
                value={step1Data?.voice_tone}
                onValueChange={(value) => {
                  setStep1Data({ ...step1Data, voice_tone: value });
                  if (errors.voice_tone) {
                    setErrors((prev) => ({ ...prev, voice_tone: false }));
                  }
                }}
                required
              >
                <SelectTrigger
                  className={`w-full  ${
                    errors.voice_tone ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Voice & Tone" />
                </SelectTrigger>
                <SelectContent>
                  {voices
                    ?.filter((voice) => {
                      // Filter based on supported voice_ids only
                      if (languageCode === "en") {
                        return [
                          "11labs-Chloe",
                          "11labs-Marissa",
                          "11labs-Zuri",
                          "11labs-Andrew",
                          "11labs-Steve",
                          "11labs-Paul",
                        ].includes(voice.voice_id);
                      } else if (languageCode === "es") {
                        return [
                          "11labs-Gilfoy",
                          "11labs-Brian",
                          "11labs-Santiago",
                          "11labs-Susan",
                          "11labs-Evie",
                          "11labs-Paola",
                        ].includes(voice.voice_id);
                      }
                      return false;
                    })
                    // ✅ Sort: Males first, Females later
                    .sort((a, b) => {
                      const malePrefix =
                        languageCode === "en"
                          ? ["11labs-Andrew", "11labs-Steve", "11labs-Paul"]
                          : [
                              "11labs-Gilfoy",
                              "11labs-Brian",
                              "11labs-Santiago",
                            ];

                      const isAMale = malePrefix.includes(a.voice_id);
                      const isBMale = malePrefix.includes(b.voice_id);

                      return Number(isBMale) - Number(isAMale);
                    })
                    .map((voice) => {
                      let label = "";

                      if (languageCode === "en") {
                        switch (voice.voice_id) {
                          case "11labs-Chloe":
                            label = "Female - Friendly & Expressive";
                            break;
                          case "11labs-Marissa":
                            label = "Female - Ethereal & Gentle";
                            break;
                          case "11labs-Zuri":
                            label = "Female - Dynamic & Versatile";
                            break;
                          case "11labs-Andrew":
                            label = "Male - Friendly & Expressive";
                            break;
                          case "11labs-Steve":
                            label = "Male - Clear & Neutral";
                            break;
                          case "11labs-Paul":
                            label = "Male - Professional";
                            break;
                        }
                      } else if (languageCode === "es") {
                        switch (voice.voice_id) {
                          case "11labs-Gilfoy":
                            label = "Male - Amistoso y Expresivo";
                            break;
                          case "11labs-Brian":
                            label = "Male - Claro y Neutral";
                            break;
                          case "11labs-Santiago":
                            label = "Male - Profesional";
                            break;
                          case "11labs-Susan":
                            label = "Female - Amistoso y Expresivo";
                            break;
                          case "11labs-Evie":
                            label = "Female - Etéreo y Suave";
                            break;
                          case "11labs-Paola":
                            label = "Female - Dinámico y Versátil";
                            break;
                        }
                      }

                      return (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {label}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <AudioPlayer1
              src={
                voices?.find(
                  (voice) => voice.voice_id === step1Data?.voice_tone
                )?.preview_audio_url || ""
              }
            />
          </div>
        </div>
        <div className="grid gap-3 mt-3">
          <Label
            htmlFor="url"
            className={` ${errors.url ? "text-red-500" : ""}`}
          >
            Business Name, Address or Website
          </Label>
          <Input
            className={` ${errors.url ? "border-red-500" : ""}`}
            value={step1Data?.url}
            onChange={(e) => {
              setStep1Data({ ...step1Data, url: e.target.value });
              handleCompleteLocation(e.target.value);
              if (errors.url) {
                setErrors((prev) => ({ ...prev, url: false }));
              }
            }}
            id="url"
            type="url"
            placeholder="Enter your business name & address or website"
            required
          />
          <div
            className={`${
              locationData?.length !== 0 ? "flex" : "hidden"
            } scrollbar-hide bg-gray-100 rounded-[3px] h-fit max-h-[150px] py-[5px] px-1 max-w-full flex items-start flex-col overflow-x-hidden`}
            style={{
              scrollbarWidth: "none" /* For Firefox */,
              msOverflowStyle: "none" /* For Internet Explorer 10+ */,
            }}
          >
            {locationData?.map((item, index) => (
              <div
                onClick={() => {
                  setStep1Data({ ...step1Data, url: item.description });
                  setLocationData([]);
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
      </form>
      <div className="text-left text-sm mt-3">
        Already a member?{" "}
        <a
          href="/login"
          className="hover:underline underline-offset-4 font-semibold"
        >
          Login
        </a>
      </div>
    </>
  );
};
