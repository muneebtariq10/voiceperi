/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { AlertCircle, CircleX, Phone, Info, ExternalLink, Bot, Mic, Bell, Save, X, Play, Square, ShieldCheck, Plus } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "./ui/switch";
import ClearableInput from "./ClearableInput";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TooltipWrapper from "./TooltipWrapper";
import AudioPlayer1 from "./audio1";
import { RetellWebClient } from "retell-client-js-sdk";
// import { Card, CardContent } from "./ui/card";
interface VoiceAgentSettingsProps {
  languages: any[];
  voices: any[];
  businessInfovoice?: string;
}
interface DecodedToken {
  firstname?: string;
  email?: string;
  sub?: string;
  // add any custom fields your token includes
}

const VoiceAgentSettings: React.FC<VoiceAgentSettingsProps> = ({
  languages,
  voices,
  businessInfovoice,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [languageCode, setLanguageCode] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>("");
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [aiPhoneNumber, setAiPhoneNumber] = useState<string>("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [agent, setAgent] = useState<any>(null);
  //const audioRef1 = useRef<HTMLAudioElement>(null);
  //const audioRef2 = useRef<HTMLAudioElement>(null);
  //const [playing1, setPlaying1] = useState(false);
  //const [playing2, setPlaying2] = useState(false);
  const [blockedNumbers, setBlockedNumbers] = useState<string[]>([]);
  const [blockedInput, setBlockedInput] = useState<string>("");
  const [block800Numbers, setBlock800Numbers] = useState<boolean>(false);
  const [showForwardingGuide, setShowForwardingGuide] = useState<boolean>(false);
  // const [elevenlabsVoices, setElevenlabsVoices] = useState<any[]>([]);
  const [hangupSalesCalls, setHangupSalesCalls] = useState<boolean>(false);
  //const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  //const [audioUrl1, setAudioUrl1] = useState<string>("");
  // const [audioUrl2, setAudioUrl2] = useState<string>("");
  console.log("selectedLanguage", selectedLanguage);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [purchasingNumber, setPurchasingNumber] = useState<boolean>(false);
  const [retellClient, setRetellClient] = useState<RetellWebClient | null>(null);
  console.log("info", businessInfovoice);
  const navigate = useNavigate();
  const handleAddItem = (
    e: React.MouseEvent<HTMLButtonElement>,
    inputValue: string,
    setInputValue: React.Dispatch<React.SetStateAction<string>>,
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    type: "emails" | "phoneNumbers" | "notes"
  ) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const limits = {
      emails: 5,
      phoneNumbers: 3,
      notes: 5,
    };

    if (array.length >= limits[type]) {
      toast.error(
        `You can only add up to ${limits[type]} ${
          type === "phoneNumbers" ? "WhatsApp numbers" : type
        }.`
      );
      return;
    }

    if (array.includes(trimmedValue)) {
      toast.error("This item already exists.");
      return;
    }

    // ✅ Format validation for email
    if (type === "emails") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        toast.error("Please enter a valid email address.");
        return;
      }
    }

    // ✅ Format validation for phone numbers
    if (type === "phoneNumbers") {
      const phoneRegex = /^\+?\d{10,15}$/; // Accepts optional + and digits, 10–15 digits long
      if (!phoneRegex.test(trimmedValue)) {
        toast.error("Please enter a valid WhatsApp number (e.g., +1234567890).");
        return;
      }
    }

    setArray([...array, trimmedValue]);
    setInputValue("");
  };
  // const togglePlay1 = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  //   const audio = audioRef1.current;
  //   if (!audio) return;

  //   if (playing1) {
  //     audio.pause();
  //   } else {
  //     audio.play();
  //     // Pause the other audio if playing
  //     if (playing2 && audioRef2.current) {
  //       audioRef2.current.pause();
  //       setPlaying2(false);
  //     }
  //   }

  //   setPlaying1(!playing1);
  // };

  // Toggle for second audio
  // const togglePlay2 = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  //   const audio = audioRef2.current;
  //   if (!audio) return;

  //   if (playing2) {
  //     audio.pause();
  //   } else {
  //     audio.play();
  //     // Pause the other audio if playing
  //     if (playing1 && audioRef1.current) {
  //       audioRef1.current.pause();
  //       setPlaying1(false);
  //     }
  //   }

  //   setPlaying2(!playing2);
  // };

  // async function handleVoice(voice_id: string, text: string) {
  //   try {
  //     setLoading(true)
  //     const response = await fetch(`${API_URL}api/agents/generate-sample`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ voice_id, text }),
  //     });

  //     if (!response.ok) throw new Error("Failed to generate audio");
  //     const arrayBuffer = await response.arrayBuffer(); // ✅ Only once
  //     // setAudioBuffer1(arrayBuffer); // Save for DB

  //     const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
  //     const audioUrl1 = URL.createObjectURL(blob);
  //     console.log('audioUrl1', audioUrl1);
  //     setAudioUrl1(audioUrl1); // Use for playback
  //     setLoading(false)
  //   } catch (err) {
  //     console.error("Error:", err);
  //     setLoading(false)
  //   }
  // }
  // async function handleVoice2(voice_id: string, text: string) {
  //   try {
  //     setLoading(true)
  //     const response = await fetch(`${API_URL}api/agents/generate-sample`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ voice_id, text }),
  //     });

  //     if (!response.ok) throw new Error("Failed to generate audio");

  //     const arrayBuffer = await response.arrayBuffer(); // ✅ Only once
  //     //setAudioBuffer2(arrayBuffer); // Save for DB

  //     const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
  //     const audioUrl2 = URL.createObjectURL(blob);
  //     console.log('audioUrl2', audioUrl2);
  //     setAudioUrl2(audioUrl2); // Use for playback
  //     setLoading(false)
  //   } catch (err) {
  //     console.error("Error:", err);
  //     setLoading(false)
  //   }
  // }
  // useEffect(() => {
  //   fetch(`${API_URL}api/agents/voices-elevenlabs`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setElevenlabsVoices(data.voices);
  //     })
  //     .catch((error) => console.error("Error fetching data:", error));
  // }, []);

  // console.log("elevenlabs", elevenlabsVoices);
  // async function findMatchingVoice(voiceName: string): Promise<string | null> {
  //   if (!voiceName?.startsWith("11labs-")) return null;

  //   const cleanName = voiceName.replace("11labs-", "").trim();
  //   if (!cleanName || elevenlabsVoices?.length === 0) return null;

  //   const matchedVoice = elevenlabsVoices?.find(
  //     (voice) => voice.name.toLowerCase() === cleanName.toLowerCase()
  //   );

  //   return matchedVoice?.voice_id || null;
  // }

  // console.log("selectedvoiceid", selectedVoiceId);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      const trimmedInput = blockedInput.trim();
      if (trimmedInput && !blockedNumbers.includes(trimmedInput)) {
        setBlockedNumbers([...blockedNumbers, trimmedInput]);
      }
      setBlockedInput("");
    }
  };

  const handleRemove = (
    e: React.MouseEvent<HTMLButtonElement>,
    number: string
  ) => {
    e.preventDefault();
    setBlockedNumbers(blockedNumbers.filter((num) => num !== number));
  };
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

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

  const handleUpdateLlm = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("userInfo.id", userInfo?.sub);
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
  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fallbackLang = selectedLanguage || (languages && languages.length > 0 ? (languages.find((l: any) => l.code === "en" || l.name === "English") || languages[0]).id : null);
      const fallbackVoice = selectedVoice || (voices && voices.length > 0 ? (voices.find((v: any) => v.voice_id === "11labs-Andrew" || v.voice_name === "Andrew") || voices[0]).voice_id : "11labs-Andrew");
      const payload = {
        language_id: fallbackLang,
        voice_id: fallbackVoice,
        agent_name: (agentName || "PrintEZ Agent").trim(),
        message: welcomeMessage.trim(),
        ai_number: aiPhoneNumber,
        emails: emails,
        phone_numbers: phoneNumbers,
        notes: notes,
        blocked_numbers: blockedNumbers,
        block_800_number: block800Numbers,
        hangup_if_call_detected: hangupSalesCalls,
      };
      let res;
      if (!agent || !agent.id) {
        res = await fetch(`${API_URL}api/agents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, user_id: userInfo?.sub }),
        });
      } else {
        res = await fetch(`${API_URL}api/agents/${userInfo?.sub}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Agent saving failure details:", errorData);
        const errMsg = errorData?.message || "Failed to update voice and language settings";
        toast.error(typeof errMsg === "object" ? JSON.stringify(errMsg) : errMsg);
        throw new Error(typeof errMsg === "string" ? errMsg : "Failed to update settings");
      }
      
      if (!agent || !agent.id) {
        const newAgent = await res.json();
        setAgent(newAgent);
      }
      
      await handleUpdateLlm(e);
      toast.success("Settings updated successfully!");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error updating settings:", error);
    }
  };
  const selectedLanguageObj = (languages || []).find(
    (lang: any) => lang.id === selectedLanguage
  );
  function getCountryCode(locale: string) {
    // Extracts the country code from locale like "ar-AE"
    const parts = locale.split("-");
    return parts[1]?.toLowerCase() || "us"; // fallback to 'us' if not found
  }
  const handleToggleCall = async () => {
    if (isCalling) {
      retellClient?.stopCall();
      setIsCalling(false);
      return;
    }

    if (!agent || !agent.id) {
      toast.error("Please save your agent first before testing!");
      return;
    }

    try {
      if (typeof window !== "undefined" && navigator?.mediaDevices?.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          toast.error(
            "Microphone access denied. Please allow microphone permissions in your browser settings.",
          );
          setIsCalling(false);
          return;
        }
      }

      toast.loading("Starting call...", { id: "call" });
      const response = await fetch(
        `${API_URL}api/agents/web-call/${agent.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create web call token");
      }

      const data = await response.json();
      if (!data?.access_token) {
        throw new Error("No web call token returned from server");
      }

      await retellClient?.startCall({
        accessToken: data.access_token,
      });
      toast.dismiss("call");
    } catch (e: any) {
      toast.dismiss("call");
      toast.error(
        e?.message || "Could not start call. Ensure microphone permissions.",
      );
      console.error(e);
      setIsCalling(false);
    }
  };

  const handlePurchaseNumber = async () => {
    if (!agent || !agent.id) {
      toast.error("Please save your agent first");
      return;
    }
    setPurchasingNumber(true);
    try {
      const res = await fetch(`${API_URL}api/agents/purchase-number/${agent.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to purchase number");
      setAiPhoneNumber(data.phone_number);
      toast.success("Phone number purchased successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to purchase phone number");
    } finally {
      setPurchasingNumber(false);
    }
  };

  useEffect(() => {
    const client = new RetellWebClient();
    setRetellClient(client);

    client.on("call_started", () => {
      setIsCalling(true);
      toast.success("Call started");
    });
    client.on("call_ended", () => {
      setIsCalling(false);
      toast.success("Call ended");
    });
    client.on("error", (error: any) => {
      setIsCalling(false);
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || error?.error || JSON.stringify(error);
      toast.error("Call error: " + errorMsg);
    });

    return () => {
      client.off("call_started");
      client.off("call_ended");
      client.off("error");
    };
  }, []);

  console.log("selectedvoice", selectedVoice);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res3 = await fetch(`${API_URL}api/agents/${userInfo?.sub}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res3.ok) {
          setAgent(null);
          if (!selectedLanguage && languages && languages.length > 0) {
            const enLang = languages.find((l: any) => l.code === "en" || l.name === "English") || languages[0];
            if (enLang) {
              setSelectedLanguage(enLang.id);
              setLanguageCode(enLang.code);
            }
          }
          if (!selectedVoice && voices && voices.length > 0) {
            const defaultVoice = voices.find((v: any) => v.voice_id === "11labs-Andrew" || v.voice_name === "Andrew") || voices[0];
            if (defaultVoice) setSelectedVoice(defaultVoice.voice_id);
          }
          return;
        }
        const json3 = await res3.json();
        setAgent(json3);
        setAgentName(json3.agent_name || "");
        setWelcomeMessage(json3.message || "");
        setBlockedNumbers(json3.blocked_numbers || []);
        setEmails(json3.emails || []);
        setAiPhoneNumber(json3.ai_number || "");
        setPhoneNumbers(json3.phone_numbers || []);
        setNotes(json3.notes || []);
        setBlock800Numbers(json3.block_800_number || false);
        setHangupSalesCalls(json3.hangup_if_call_detected || false);
        setSelectedLanguage(json3.language?.id || json3.language_id || null);
        setLanguageCode(json3.language?.code || null);
        setSelectedVoice(json3.voice_id || null);
        const userVoiceId = json3.voice_id;
        const matchingVoice = (voices || []).find(
          (voice: any) => voice.voice_id === userVoiceId
        );

        if (matchingVoice) {
          setSelectedVoice(matchingVoice.voice_id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (userInfo?.sub) {
      fetchData();
    }
  }, [userInfo?.sub, API_URL, languages, voices, token]);
  console.log("agent", agent);
  // const text = `Hi, my name is ${agentName}, and I'm here to assist you. How can I help you today?`;
  // console.log('audioUrl1', audioUrl1);
  // console.log('audioUrl2', audioUrl2);
  console.log("selectedVoice", selectedVoice);

  useEffect(() => {
    if (languages && languages.length > 0 && selectedLanguage) {
      const newSelectedLanguage = languages.find(
        (lang: any) => lang.id === selectedLanguage
      );
      if (newSelectedLanguage) {
        setLanguageCode(newSelectedLanguage.code);
      }
    }
  }, [languages, selectedLanguage]);
  console.log("language", languages);
  //console.log("selected language", step1Data?.language);
  console.log("language code", languageCode);

  // const matchedVoiceId = await findMatchingVoice(value);
  // if (matchedVoiceId) {
  //   setSelectedVoiceId(matchedVoiceId); // Update state
  //   handleVoice(matchedVoiceId, text);
  //   handleVoice2(matchedVoiceId, businessInfovoice ?? "");
  // }
  return (
    <div className="flex flex-col w-full gap-8 mt-2">
      {/* Card 1: AI Persona & Voice Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-lg shadow-slate-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-slate-100">
          <div className="p-3 bg-teal-50 rounded-xl text-[#1c9c84] border border-teal-100/60 shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">AI Persona & Voice Behavior</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Customize your agent's identity, dialect, vocal characteristics, and opening greeting.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col items-start">
            <label
              htmlFor="agentName"
              className="text-sm font-semibold text-slate-700 mb-2"
            >
              Agent Name
            </label>
            <Input
              id="agentName"
              className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] transition-all duration-200 rounded-xl text-slate-800 placeholder:text-slate-400"
              placeholder="e.g. TestUser Agent"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
          </div>

          <div className="flex flex-col items-start">
            <label
              className="text-sm font-semibold text-slate-700 mb-2"
            >
              Speak & Understand Language
            </label>
            <Select
              value={selectedLanguage || ""}
              onValueChange={(value) => {
                setSelectedLanguage(value);
                setSelectedVoice("");
              }}
            >
              <SelectTrigger className="w-full h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] rounded-xl text-slate-800 font-medium">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>

              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                {selectedLanguageObj && (
                  <SelectItem
                    key={selectedLanguageObj.id}
                    value={selectedLanguageObj.id}
                    className="cursor-pointer rounded-lg font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://flagcdn.com/w40/${getCountryCode(
                          selectedLanguageObj.locale
                        )}.png`}
                        alt=""
                        className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                      />
                      {selectedLanguageObj.name}
                    </div>
                  </SelectItem>
                )}

                {(languages || [])
                  .filter((language: any) => language.id !== selectedLanguage)
                  .map((language: any) => (
                    <SelectItem key={language.id} value={language.id} className="cursor-pointer rounded-lg font-medium">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://flagcdn.com/w40/${getCountryCode(
                            language.locale
                          )}.png`}
                          alt=""
                          className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                        />
                        {language.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col items-start md:col-span-2">
            <div className="flex items-center justify-between w-full mb-2">
              <label
                htmlFor="welcomeMsg"
                className="flex gap-2 items-center text-sm font-semibold text-slate-700"
              >
                Welcome Message
                <TooltipWrapper tooltipText="The initial greeting your voice agent says as soon as the customer calls.">
                  <AlertCircle className="w-4 h-4 text-[#1c9c84] cursor-pointer" />
                </TooltipWrapper>
              </label>
              <span className="text-xs font-semibold text-[#1c9c84] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                First impression
              </span>
            </div>
            <Textarea
              id="welcomeMsg"
              className="resize-none w-full h-28 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] rounded-xl p-3.5 text-slate-800 transition-all duration-200 text-sm placeholder:text-slate-400 leading-relaxed"
              placeholder="Hi, thanks for calling PrintEZ! How can I assist with your order or questions today?"
              value={welcomeMessage !== "null" ? welcomeMessage : ""}
              onChange={(e) => setWelcomeMessage(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full md:col-span-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            <div className="flex flex-col flex-1">
              <label
                className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-[#1c9c84]" />
                Voice & Vocal Tone
              </label>
              <Select
                value={selectedVoice || ""}
                onValueChange={(value) => setSelectedVoice(value)}
              >
                <SelectTrigger className="w-full h-11 bg-white border-slate-200 focus:ring-2 focus:ring-[#1c9c84]/20 rounded-xl font-medium text-slate-800 shadow-sm">
                  <SelectValue placeholder="Select Voice & Tone" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  {(voices || [])
                    .sort((a: any, b: any) =>
                      a.voice_id === selectedVoice
                        ? -1
                        : b.voice_id === selectedVoice
                        ? 1
                        : 0
                    )
                    .map((voice: any) => {
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
                          default:
                            return null;
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
                          default:
                            return null;
                        }
                      } else {
                        return null;
                      }

                      return (
                        <SelectItem key={voice.voice_id} value={voice.voice_id} className="cursor-pointer rounded-lg font-medium">
                          {label}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            {/* Audio Preview Component */}
            <div className="flex items-center min-w-[240px] bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
              <AudioPlayer1
                src={
                  voices?.find((voice: any) => voice.voice_id === selectedVoice)
                    ?.preview_audio_url || ""
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Telephony & Connection */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-lg shadow-slate-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-slate-100">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/60 shadow-sm">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inbound Telephony & Call Routing</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Connect a live phone number so callers directly interact with your autonomous agent.</p>
          </div>
        </div>

        <div className="flex flex-col items-start w-full gap-5">
          <div className="flex items-center justify-between w-full">
            <label className="flex gap-2 items-center text-sm font-semibold text-slate-700">
              Inbound Phone Number
              <TooltipWrapper tooltipText="Get an AI phone number, then forward your business line to it so customers call your existing number and the AI answers.">
                <AlertCircle className="w-4 h-4 text-[#1c9c84] cursor-pointer" />
              </TooltipWrapper>
            </label>
            <a
              href="https://beta.retellai.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#1c9c84] hover:text-[#16806c] hover:underline flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-lg transition-colors border border-teal-100"
            >
              Manage Billing on Retell AI <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <Input
              type="tel"
              placeholder="+1 (xxx) xxx-xxxx (Manually enter or get via Retell)"
              className="w-full h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1c9c84]/20 focus:border-[#1c9c84] rounded-xl text-slate-800 font-mono text-sm placeholder:text-slate-400 placeholder:font-sans"
              value={aiPhoneNumber}
              onChange={(e) => setAiPhoneNumber(e.target.value)}
            />
            <Button
              type="button"
              onClick={handlePurchaseNumber}
              disabled={purchasingNumber}
              className="w-full sm:w-auto px-6 h-11 bg-[#1c9c84] hover:bg-[#16806c] text-white font-semibold rounded-xl shadow-md shadow-teal-500/20 hover:shadow-teal-500/35 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95"
            >
              {purchasingNumber ? "Setting up..." : "Get via Retell"}
            </Button>
          </div>

          {/* Call forwarding accordion */}
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl w-full overflow-hidden transition-all duration-200 mt-1">
            <button
              type="button"
              onClick={() => setShowForwardingGuide(!showForwardingGuide)}
              className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-100/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-teal-100 rounded-lg text-[#1c9c84]">
                  <Info className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800">How to connect your existing business number (Call Forwarding Guide)</span>
              </div>
              <span className={`text-slate-500 text-lg transition-transform duration-200 font-mono ${showForwardingGuide ? "rotate-180" : ""}`}>▾</span>
            </button>

            {showForwardingGuide && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-200/60">
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Set up <strong>call forwarding</strong> on your physical business phone so incoming calls are automatically routed to your AI agent without changing your publicized number:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#1c9c84] text-white text-xs flex items-center justify-center font-bold shadow-sm">1</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Open Phone Dialer</p>
                      <p className="text-xs text-slate-500 mt-1">On the office phone or mobile device that customers currently call.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#1c9c84] text-white text-xs flex items-center justify-center font-bold shadow-sm">2</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Dial Forwarding Code</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Dial <code className="bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded text-[#1c9c84] font-mono font-bold">*72{aiPhoneNumber || "[AI_NUMBER]"}</code> & call.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#1c9c84] text-white text-xs flex items-center justify-center font-bold shadow-sm">3</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Wait for Tone</p>
                      <p className="text-xs text-slate-500 mt-1">Listen for a confirmation beep or message confirming forwarding is active.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-3">
                  <span className="text-lg">💡</span>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    <strong>Pro Tip:</strong> The code <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">*72</code> works for most US carriers (Verizon, AT&T, etc.). To turn off automatic forwarding at any time, simply dial <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">*73</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Call Security & Spam Guardrails */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-lg shadow-slate-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-slate-100">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100/60 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Call Security & Spam Guardrails</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Protect your AI phone lines from robocallers, spam telemarketers, and toll-free spam.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-slate-800 block">Block 1-800 Toll-Free Numbers</span>
                <span className="text-xs text-slate-500">Automatically drop calls originating from 800/888 telemarketing prefixes.</span>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#1c9c84] cursor-pointer scale-110 shadow-sm"
                checked={block800Numbers}
                onCheckedChange={(checked) => setBlock800Numbers(checked)}
              />
            </div>

            <hr className="border-slate-200/60" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-slate-800 block">AI Sales Call Auto-Hangup</span>
                <span className="text-xs text-slate-500">Instruct AI to politely terminate the line if a solicitation or robocall is identified.</span>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#1c9c84] cursor-pointer scale-110 shadow-sm"
                checked={hangupSalesCalls}
                onCheckedChange={(checked) => setHangupSalesCalls(checked)}
              />
            </div>
          </div>

          <div className="flex flex-col items-start w-full">
            <label
              htmlFor="blockedNumbersInput"
              className="flex gap-2 items-center text-sm font-semibold text-slate-700 mb-2"
            >
              Blacklisted Phone Numbers
              <TooltipWrapper tooltipText="Enter phone numbers to block from calling your agent.">
                <AlertCircle className="w-4 h-4 text-[#1c9c84] cursor-pointer" />
              </TooltipWrapper>
            </label>
            <div
              className="border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1c9c84]/20 focus-within:border-[#1c9c84] transition-all duration-200 rounded-xl p-3 w-full min-h-[120px] flex flex-wrap items-start gap-2 shadow-inner"
              id="blockedNumbersInput"
            >
              {blockedNumbers.map((number, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200/80 text-rose-800 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm animate-fadeIn"
                >
                  {number}
                  <button
                    onClick={(e) => handleRemove(e, number)}
                    className="text-rose-400 hover:text-rose-700 focus:outline-none transition-colors ml-0.5 cursor-pointer"
                  >
                    <CircleX className="w-4 h-4" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={blockedInput}
                onChange={(e) => setBlockedInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[140px] bg-transparent border-none focus:outline-none text-sm text-slate-800 placeholder:text-slate-400 font-mono mt-0.5"
                placeholder={
                  blockedNumbers.length === 0
                    ? "Type number & press Enter to block..."
                    : "Add another..."
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Post-Call Actions & Intelligence */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-lg shadow-slate-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-slate-100">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/60 shadow-sm">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Post-Call Notifications & AI Note-Taking</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Configure real-time delivery of call summaries, recordings, and custom qualification notes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Email notifications */}
          <div className="flex flex-col h-full items-start bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70">
            <label className="flex gap-2 items-center text-sm font-bold text-slate-800 mb-1">
              Email Notifications
              <TooltipWrapper tooltipText="Receive automated call summaries and recording links directly in your inbox.">
                <AlertCircle className="w-4 h-4 text-[#1c9c84] cursor-pointer" />
              </TooltipWrapper>
            </label>
            <span className="text-xs text-slate-500 mb-4">Send full call transcript & analysis to up to 5 team emails.</span>

            <div className="flex flex-col gap-2.5 w-full mb-3">
              {emails.map((email, index) => (
                <ClearableInput
                  type="email"
                  key={index}
                  value={email}
                  onChange={(e) => {
                    const updatedEmails = [...emails];
                    updatedEmails[index] = e.target.value;
                    setEmails(updatedEmails);
                  }}
                  onClear={() => {
                    const updatedEmails = emails.filter((_, i) => i !== index);
                    setEmails(updatedEmails);
                  }}
                />
              ))}
            </div>

            <div className="w-full flex items-center gap-2 mt-auto">
              <Input
                placeholder="Enter team email address..."
                className="flex-1 h-10 bg-white border-slate-200 focus:ring-2 focus:ring-[#1c9c84]/20 rounded-xl text-xs"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <Button
                type="button"
                className="bg-[#1c9c84] hover:bg-[#16806c] text-white font-semibold cursor-pointer rounded-xl px-3.5 h-10 flex items-center gap-1 text-xs shadow-sm active:scale-95 transition-all"
                onClick={(e) =>
                  handleAddItem(
                    e,
                    emailInput,
                    setEmailInput,
                    emails,
                    setEmails,
                    "emails"
                  )
                }
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <p className="text-slate-400 text-[11px] mt-2.5 font-medium">
              {emails.length}/5 maximum recipients configured
            </p>
          </div>

          {/* WhatsApp notifications */}
          <div className="flex flex-col h-full items-start bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70">
            <label className="flex gap-2 items-center text-sm font-bold text-slate-800 mb-1">
              WhatsApp Notifications
              <TooltipWrapper tooltipText="Receive call summaries via WhatsApp (requires Twilio WhatsApp Business API).">
                <AlertCircle className="w-4 h-4 text-[#1c9c84] cursor-pointer" />
              </TooltipWrapper>
            </label>
            <span className="text-xs text-slate-500 mb-4">Instant mobile text notifications for priority customer calls.</span>

            <div className="flex flex-col gap-2.5 w-full mb-3">
              {phoneNumbers.map((phone, index) => (
                <ClearableInput
                  type="tel"
                  key={index}
                  value={phone}
                  onChange={(e) => {
                    const updatedPhones = [...phoneNumbers];
                    updatedPhones[index] = e.target.value;
                    setPhoneNumbers(updatedPhones);
                  }}
                  onClear={() => {
                    const updatedPhones = phoneNumbers.filter(
                      (_, i) => i !== index
                    );
                    setPhoneNumbers(updatedPhones);
                  }}
                />
              ))}
            </div>

            <div className="w-full flex items-center gap-2 mt-auto">
              <Input
                type="tel"
                placeholder="+1234567890 (WhatsApp)..."
                className="flex-1 h-10 bg-white border-slate-200 focus:ring-2 focus:ring-[#1c9c84]/20 rounded-xl text-xs font-mono"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
              <Button
                type="button"
                className="bg-[#1c9c84] hover:bg-[#16806c] text-white font-semibold cursor-pointer rounded-xl px-3.5 h-10 flex items-center gap-1 text-xs shadow-sm active:scale-95 transition-all"
                onClick={(e) =>
                  handleAddItem(
                    e,
                    phoneInput,
                    setPhoneInput,
                    phoneNumbers,
                    setPhoneNumbers,
                    "phoneNumbers"
                  )
                }
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <div className="w-full text-slate-600 text-[11px] mt-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
              <strong>Info:</strong> Requires an official <strong>WhatsApp Business API</strong> account (via <a href="https://www.twilio.com/whatsapp" target="_blank" rel="noopener noreferrer" className="text-[#1c9c84] hover:underline font-bold">Twilio</a>).
            </div>
          </div>

          {/* Note taking */}
          <div className="flex flex-col h-full items-start bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70">
            <label className="flex gap-2 items-center text-sm font-bold text-slate-800 mb-1">
              AI Note-Taking Questions
              <TooltipWrapper tooltipText="Instruct the AI to specifically ask for and note down these answers during conversation.">
                <AlertCircle className="w-4 h-4 text-[#1c9c84] cursor-pointer" />
              </TooltipWrapper>
            </label>
            <span className="text-xs text-slate-500 mb-4">Define key qualification metrics for the AI to extract per call.</span>

            <div className="flex flex-col gap-2.5 w-full mb-3">
              {notes.map((note, index) => (
                <ClearableInput
                  type="text"
                  key={index}
                  value={note}
                  onChange={(e) => {
                    const updatedNotes = [...notes];
                    updatedNotes[index] = e.target.value;
                    setNotes(updatedNotes);
                  }}
                  onClear={() => {
                    const updatedNotes = notes.filter((_, i) => i !== index);
                    setNotes(updatedNotes);
                  }}
                />
              ))}
            </div>

            <div className="w-full flex items-center gap-2 mt-auto">
              <Input
                placeholder="e.g. What is their project budget?"
                className="flex-1 h-10 bg-white border-slate-200 focus:ring-2 focus:ring-[#1c9c84]/20 rounded-xl text-xs"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button
                type="button"
                className="bg-[#1c9c84] hover:bg-[#16806c] text-white font-semibold cursor-pointer rounded-xl px-3.5 h-10 flex items-center gap-1 text-xs shadow-sm active:scale-95 transition-all"
                onClick={(e) =>
                  handleAddItem(
                    e,
                    noteInput,
                    setNoteInput,
                    notes,
                    setNotes,
                    "notes"
                  )
                }
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <p className="text-slate-400 text-[11px] mt-2.5 font-medium">
              {notes.length}/5 maximum note extraction rules configured
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Floating Save Bar */}
      <div className="sticky bottom-6 z-30 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200/80 shadow-2xl flex items-center justify-between gap-4 mt-2">
        <span className="text-xs sm:text-sm font-medium text-slate-500 hidden md:inline-block">
          Test your agent to verify voice tone before saving updates to production.
        </span>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-95"
            onClick={() => navigate("/dashboard")}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          
          <Button
            type="button"
            onClick={handleToggleCall}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer active:scale-95 shadow-lg ${
              isCalling
                ? "bg-gradient-to-r from-red-500 to-rose-600 border-none shadow-red-500/35 hover:from-red-600 hover:to-rose-700 animate-pulse"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 border-none shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02]"
            }`}
          >
            {isCalling ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                End Live Test
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Test Live Agent
              </>
            )}
          </Button>

          <Button
            disabled={loading}
            type="button"
            onClick={(e) => {
              handleSave(e);
            }}
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
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentSettings;
