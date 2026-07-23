/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { AlertCircle, CircleX, Phone, Info, ExternalLink } from "lucide-react";
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
      const payload = {
        language_id: selectedLanguage,
        voice_id: selectedVoice,
        agent_name: agentName.trim(),
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
        toast.error("Failed to update voice and language settings");
        throw new Error("Failed to update settings");
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
        } catch (micErr) {
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
    <div className="flex flex-col w-full">
      <form className="grid grid-cols-1 md:grid-cols-2 w-full md:w-[75%] mt-[30px] py-5 gap-x-[80px] gap-y-[30px]">
        <div className="flex flex-col items-start">
          <label
            htmlFor="profile"
            className="text-[16px] md:text-[20px] font-[600] mb-[7px] text-default"
          >
            Agent Name
          </label>
          <Input
            className="h-[40px]"
            id="profile"
            placeholder="Not Set"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
          />
        </div>

        <div className="flex flex-col items-start">
          <label
            htmlFor="profile"
            className="text-[16px] md:text-[20px] font-[600] mb-[7px] text-default"
          >
            Speak & Understand
          </label>
          {/* <Input  id="profile" placeholder="Not Set" /> */}
          <Select
            value={selectedLanguage || ""}
            onValueChange={(value) => {
              setSelectedLanguage(value);
              setSelectedVoice("");
            }}
          >
            <SelectTrigger className="w-full !h-[40px] border rounded-[8px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>

            <SelectContent>
              {selectedLanguageObj && (
                <SelectItem
                  key={selectedLanguageObj.id}
                  value={selectedLanguageObj.id}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w40/${getCountryCode(
                        selectedLanguageObj.locale
                      )}.png`}
                      alt=""
                      className="w-5 h-4 object-cover rounded-sm"
                    />
                    {selectedLanguageObj.name}
                  </div>
                </SelectItem>
              )}

              {/* Then show the rest */}
              {(languages || [])
                .filter((language: any) => language.id !== selectedLanguage)
                .map((language: any) => (
                  <SelectItem key={language.id} value={language.id}>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w40/${getCountryCode(
                          language.locale
                        )}.png`}
                        alt=""
                        className="w-5 h-4 object-cover rounded-sm"
                      />
                      {language.name}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-start">
          <label
            htmlFor="overview"
            className="flex gap-[10px] items-center text-[16px] md:text-[20px] font-[600] mb-[7px]"
          >
            Welcome Message
            <TooltipWrapper tooltipText="Write welcome message for customer here">
              <AlertCircle className="w-[16px] h-[16px] text-[#5222FF]" />
            </TooltipWrapper>
          </label>

          <Textarea
            id="overview"
            className="resize-none w-full h-[120px] border-[1px] border-gray-200 rounded-[8px] p-[10px]"
            placeholder="Business Overview"
            value={welcomeMessage != "null" ? welcomeMessage : ""}
            onChange={(e) => setWelcomeMessage(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex justify-between gap-3 w-full">
            {/* Voice Selector */}
            <div className="flex flex-col flex-1">
              <label
                htmlFor="profile"
                className="text-[16px] md:text-[20px] font-[600] mb-[7px] text-left"
              >
                Voice & Tone
              </label>
              <Select
                value={selectedVoice || ""}
                onValueChange={(value) => setSelectedVoice(value)}
              >
                <SelectTrigger className="w-full !h-[40px] border rounded-[8px]">
                  <SelectValue placeholder="Select Voice" />
                </SelectTrigger>
                <SelectContent>
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
                            return null; // don't render other voices
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
                            return null; // don't render other voices
                        }
                      } else {
                        return null; // hide voices if languageCode is not "en" or "es"
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

            {/* Audio Preview */}
            <div className="flex items-end">
              <AudioPlayer1
                src={
                  voices?.find((voice: any) => voice.voice_id === selectedVoice)
                    ?.preview_audio_url || ""
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full items-start w-full md:col-span-2">
          <label className="flex gap-[10px] items-center text-[16px] md:text-[20px] font-[600] mb-[7px]">
            <Phone className="w-5 h-5 text-[#5222FF]" />
            Inbound Phone Number
            <TooltipWrapper tooltipText="Get an AI phone number, then forward your business line to it so customers call your existing number and the AI answers.">
              <AlertCircle className="w-[16px] h-[16px] text-[#5222FF]" />
            </TooltipWrapper>
          </label>
          <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex items-center gap-3 w-full">
              <Input
                type="tel"
                placeholder="+1 (xxx) xxx-xxxx (Manually enter or get via Retell)"
                className="w-full h-[40px]"
                value={aiPhoneNumber}
                onChange={(e) => setAiPhoneNumber(e.target.value)}
              />
              <Button 
                type="button" 
                onClick={handlePurchaseNumber}
                disabled={purchasingNumber}
                className="bg-[#5222FF] text-white hover:bg-[#3822ff] whitespace-nowrap h-[40px]"
              >
                {purchasingNumber ? "Setting up..." : "Get via Retell"}
              </Button>
            </div>
            <div className="flex w-full justify-end -mt-2">
              <a 
                href="https://beta.retellai.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#5222FF] hover:underline flex items-center gap-1"
              >
                Manage Billing on Retell AI <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Call forwarding instructions */}
            <div className="bg-white border border-gray-200 rounded-xl w-full overflow-hidden mt-2">
              <button
                type="button"
                onClick={() => setShowForwardingGuide(!showForwardingGuide)}
                className="flex items-center justify-between w-full px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#5222FF]" />
                  <span className="font-semibold text-sm text-gray-800">How to connect your business number</span>
                </div>
                <span className={`text-gray-400 transition-transform duration-200 ${showForwardingGuide ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {showForwardingGuide && (
                <div className="px-5 pb-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mt-3 mb-3">
                    Set up <strong>call forwarding</strong> on your business phone so incoming calls are automatically routed to your AI agent:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5222FF] text-white text-xs flex items-center justify-center font-bold">1</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Open your phone's dialer</p>
                        <p className="text-xs text-gray-500">On the business phone that customers already call</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5222FF] text-white text-xs flex items-center justify-center font-bold">2</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Dial the forwarding code</p>
                        <p className="text-xs text-gray-500">
                          Type <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#5222FF] font-mono font-bold">*72{aiPhoneNumber || "[AI_NUMBER]"}</code> and press Call
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5222FF] text-white text-xs flex items-center justify-center font-bold">3</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Wait for confirmation</p>
                        <p className="text-xs text-gray-500">You'll hear a tone or message confirming forwarding is active</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      <strong>💡 Note:</strong> The code <code className="font-mono">*72</code> works for most US carriers. For other regions, check your carrier's call forwarding instructions. To disable forwarding later, dial <code className="font-mono">*73</code>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full items-start w-full">
          <label
            htmlFor="blockedNumbersInput"
            className="flex gap-[10px] items-center text-[16px] md:text-[20px] font-[600] mb-[7px]"
          >
            Blocked Numbers
            <TooltipWrapper tooltipText="Write numbers to block">
              <AlertCircle className="w-[16px] h-[16px] text-[#5222FF]" />
            </TooltipWrapper>
          </label>
          <div
            className="border rounded p-2 w-full min-h-[100px] flex flex-wrap items-start gap-2"
            id="blockedNumbersInput"
          >
            {blockedNumbers.map((number, index) => (
              <span
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {number}
                <button
                  onClick={(e) => handleRemove(e, number)}
                  className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
                >
                  <CircleX className="w-4 h-4" />
                </button>
              </span>
            ))}

            {/* Tiny input inside the textarea div */}
            <input
              type="text"
              value={blockedInput}
              onChange={(e) => setBlockedInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-[100px] border-none focus:outline-none text-sm"
              placeholder={
                blockedNumbers.length === 0
                  ? "Type numbers and press Enter..."
                  : ""
              }
            />
          </div>
        </div>
        <div className="flex flex-col items-start">
          <label
            htmlFor="overview"
            className="flex gap-[10px] items-center text-[16px] md:text-[20px] font-[600] mb-[7px]"
          >
            Spam Safety{" "}
            <TooltipWrapper tooltipText="enable span safety">
              <AlertCircle className="w-[16px] h-[16px] text-[#5222FF]" />
            </TooltipWrapper>
          </label>
          <div className="flex items-center gap-4 pt-[10px]">
            <Switch
              className="data-[state=checked]:bg-blue-500"
              checked={block800Numbers}
              onCheckedChange={(checked) => setBlock800Numbers(checked)}
            />
            <label className="text-[16px] font-[500]">
              Block 1-800 numbers
            </label>
          </div>

          <div className="flex items-center gap-4 pt-[10px]">
            <Switch
              className="data-[state=checked]:bg-blue-500"
              checked={hangupSalesCalls}
              onCheckedChange={(checked) => setHangupSalesCalls(checked)}
            />
            <label className="text-[16px] font-[500]">
              Hang up if sales call detected
            </label>
          </div>
        </div>
        <div className="flex flex-col h-full items-start">
          <label
            htmlFor="services"
            className="flex gap-[10px] items-center text-[16px] md:text-[20px] font-[600] mb-[7px]"
          >
            Email Notifications{" "}
            <TooltipWrapper tooltipText="Write emails here to get notifications">
              <AlertCircle className="w-[16px] h-[16px] text-[#5222FF]" />
            </TooltipWrapper>
          </label>
          <div className="flex flex-col gap-2 w-full">
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
          <div className="w-full flex justify-between mt-[10px]">
            <Input
              placeholder="Add email addresses to get notified"
              className="w-[80%] h-[40px]"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <Button
              className="bg-default-purple hover:bg-default-lightblue cursor-pointer rounded-[8px]"
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
              Add
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-1 text-center">
            You can add a maximum of 5 emails here
          </p>
        </div>
        <div className="flex flex-col h-full items-start">
          <label
            htmlFor="services"
            className="flex gap-[10px] items-center text-[16px] md:text-[20px] font-[600] mb-[7px]"
          >
            WhatsApp Notifications
            <TooltipWrapper tooltipText="Add phone numbers here to receive WhatsApp notifications">
              <AlertCircle className="w-[16px] h-[16px] text-[#5222FF]" />
            </TooltipWrapper>
          </label>
          <div className="flex flex-col gap-2 w-full">
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
          <div className="w-full flex justify-between mt-[10px]">
            <Input
              type="tel"
              placeholder="Add phone numbers to get notified"
              className="w-[80%] h-[40px]"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
            <Button
              className="bg-default-purple hover:bg-default-lightblue cursor-pointer rounded-[8px]"
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
              Add
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-1 text-center">
            You can add a maximum of 5 WhatsApp no. here
          </p>
          <div className="w-full text-gray-500 text-xs mt-2 bg-gray-50 p-3 rounded border border-gray-200 text-left">
            <strong>Note:</strong> Sending automated messages requires an official <strong>WhatsApp Business API</strong> number (e.g., registered via <a href="https://www.twilio.com/whatsapp" target="_blank" rel="noopener noreferrer" className="text-[#5222FF] hover:underline">Twilio</a>). A standard WhatsApp Business app number on a mobile phone cannot be used directly unless migrated to the API.
          </div>
        </div>

        <div className="flex flex-col h-full items-start">
          <label
            htmlFor="services"
            className="flex gap-[10px] items-center text-[16px] md:text-[20px] font-[600] mb-[7px]"
          >
            Taking Notes
            <TooltipWrapper tooltipText="Write questions here for the agent to ask the customer">
              <AlertCircle className="w-[16px] h-[16px] text-[#5222FF]" />
            </TooltipWrapper>
          </label>
          <div className="flex flex-col gap-2 w-full">
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
          <div className="w-full flex justify-between mt-[10px]">
            <Input
              placeholder="Type your question for note-taking"
              className="w-[80%] h-[40px]"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <Button
              className="bg-default-purple hover:bg-default-lightblue cursor-pointer rounded-[8px]"
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
              Add
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-1 text-center">
            You can add a maximum of 5 questions here
          </p>
        </div>
      </form>
      <div className="my-[40px] flex justify-end gap-[20px]">
        <button
          className="w-[175px] h-[50px] cursor-pointer rounded-[8px] border-[1px] border-[#5222FF] text-[#5222FF]"
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </button>
        <Button
          type="button"
          onClick={handleToggleCall}
          className={`w-[175px] h-[50px] rounded-[8px] border-[1px] text-[white] cursor-pointer mr-4 transition-colors ${
            isCalling
              ? "border-[#ef4444] bg-[#ef4444] hover:bg-[#dc2626] animate-pulse"
              : "border-[#10b981] bg-[#10b981] hover:bg-[#059669]"
          }`}
        >
          {isCalling ? "End Call" : "Test Agent"}
        </Button>
        <Button
          disabled={loading}
          type="button"
          onClick={(e) => {
            handleSave(e);
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
      </div>
    </div>
  );
};

export default VoiceAgentSettings;
