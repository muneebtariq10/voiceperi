import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AuthRightSec } from "./AuthRightSec";
import { Step1 } from "./step-1";
import { Step2 } from "./step-2";
import { Step3 } from "./step-3";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { AppUser } from "@/AppContext";
const steps = ["Step 1", "Step 2", "Step 3"];
type Step1Data = {
  name: string;
  email: string;
  confirm: boolean;
  agentName: string;
  language: string;
  voice_tone: string;
  url: string;
};
interface DecodedToken {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  sub?: string;
}
interface Voice {
  voice_id: string;
  voice_type: string;
  standard_voice_type: string;
  name: string;
  provider: string;
  accent: string;
  gender: string;
  age: string;
  avatar_url: string;
  preview_audio_url: string;
}

export const SignUpForm = () => {
  const { setUser } = AppUser();
  const [activeStep, setActiveStep] = useState(0);
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  // const [audioBuffer1, setAudioBuffer1] = useState<ArrayBuffer | null>(null);
  // const [audioBuffer2, setAudioBuffer2] = useState<ArrayBuffer | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof Step1Data, boolean>>
  >({});
  // const [elevenlabsVoices, setElevenlabsVoices] = useState<Voice[] | null>(
  //   null
  // );
  type BusinessInfo = {
    name?: string;
    formatted_address?: string;
    international_phone_number?: string;
    [key: string]: any;
  };
  const [businessinfo, setBusinessinfo] = useState<BusinessInfo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: false,
  });

  const [step1Data, setStep1Data] = useState<Step1Data>({
    name: "",
    email: "",
    confirm: false,
    agentName: "",
    language: "",
    voice_tone: "",
    url: "",
  });
  const [step1FormData, setstep1FormData] = useState<Step1Data>({
    name: "",
    email: "",
    confirm: false,
    agentName: "",
    language: "",
    voice_tone: "",
    url: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  console.log(step1FormData);

  // const [audioUrl1, setAudioUrl1] = useState("");
  // const [audioUrl2, setAudioUrl2] = useState("");
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState(null);
  type Language = {
    id: string;
    name: string;
    locale: string;
    [key: string]: any;
    status: boolean;
    code: string;
  };
  const [languages, setlanguages] = useState<Language[]>([]);
  const hasSubmittedRef = useRef(false);

  //  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);

  // const { search } = useLocation();
  // const query = new URLSearchParams(search);
  // const token = query.get("token");
  const token = localStorage.getItem("authToken");

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  // console.log('audiourl1', audioUrl1);
  // console.log('audiourl2', audioUrl2);

  useEffect(() => {
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);

        if (decoded) {
          (async () => {
            try {
              const res = await fetch(`${API_URL}api/users/${decoded?.sub}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              const userData = await res.json();
              setUserInfo(userData);
              console.log(userInfo, "userInfo after setting it from token");
              setFormData((prev) => ({
                ...prev,
                name: userData.firstname || "",
                email: userData.email || "",
              }));
              const step1DataString = localStorage.getItem("step1Data");
              let step1FormData = step1DataString
                ? JSON.parse(step1DataString)
                : null;
              setStep1Data(step1FormData);
              setstep1FormData(step1FormData);
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          })();
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);
  useEffect(() => {
    const isStep1Complete =
      step1Data?.agentName?.trim() &&
      step1Data?.language?.trim() &&
      step1Data?.voice_tone?.trim() &&
      step1Data?.url?.trim();
    const fromStepOne = localStorage.getItem("fromStepOne") === "true";
    if (
      token &&
      userInfo?.id &&
      isStep1Complete &&
      fromStepOne &&
      !hasSubmittedRef.current
    ) {
      const userId = userInfo.id;

      (async () => {
        try {
          hasSubmittedRef.current = true;
          await handleBusinessInfo(userId);
          await handleCreateAgent(userId, token);
          toast.success("Account created successfully!");
          localStorage.setItem("authToken", token);
          localStorage.setItem("user_id", userId);
          localStorage.removeItem("step1Data");
          localStorage.removeItem("fromStepOne");
          navigate("/dashboard");
        } catch (error) {
          console.error("Auto submission failed:", error);
        }
      })();
    }
  }, [token, userInfo?.id, step1Data]);

  // useEffect(() => {
  //   if (!step1Data?.voice_tone?.startsWith("11labs-")) return;

  //   const voiceName = step1Data.voice_tone.replace("11labs-", "").trim();

  //   if (!voiceName || elevenlabsVoices?.length === 0) return;

  //   const matchedVoice = elevenlabsVoices?.find(
  //     (voice) => voice.name.toLowerCase() === voiceName.toLowerCase()
  //   );

  //   if (matchedVoice) {
  //     setSelectedVoiceId(matchedVoice.voice_id);
  //   } else {
  //     setSelectedVoiceId(null);
  //   }
  // }, [step1Data?.voice_tone, elevenlabsVoices]);

  // console.log("selectedvoiceid", selectedVoiceId);
  useEffect(() => {
    if (userInfo) {
      let name = userInfo.firstname + " " + userInfo.lastname;
      setFormData((prev) => ({
        ...prev,
        name: name || "",
        email: userInfo.email || "",
      }));
    }
  }, [userInfo]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}api/agents/voices`)
      .then((response) => response.json())
      .then((data) => {
        // Filter voices where provider is 'elevenlabs'
        const elevenLabsVoices = data.filter(
          (voice: Voice) =>
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
        setVoices(elevenLabsVoices);
      })
      .catch((error) => console.error("Error fetching voices:", error));
  }, []);
  console.log("voices", voices);
  // useEffect(() => {
  //   fetch(`${API_URL}api/agents/voices-elevenlabs`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setElevenlabsVoices(data.voices);
  //     })
  //     .catch((error) => console.error("Error fetching data:", error));
  // }, []);

  // console.log("elevenlabs", elevenlabsVoices);
  useEffect(() => {
    fetch(`${API_URL}api/agents/languages`)
      .then((response) => response.json())
      .then((data) => {
        const activeLanguages = data.filter(
          (lang: Language) => lang.status === true
        );
        setlanguages(activeLanguages);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  //console.log("languages", languages);
  function handleGoogleLogin(fromStepOne = false) {
    setIsLoading(true);

    if (fromStepOne) {
      localStorage.setItem("step1Data", JSON.stringify(step1Data));
      localStorage.setItem("fromStepOne", "true"); // ✅ set flag only if fromStepOne is true
    } else {
      localStorage.removeItem("fromStepOne"); // 🧹 clean up in other case
      localStorage.setItem("step1Data", JSON.stringify(step1Data));
    }

    window.location.href = `${API_URL}api/auth/google/login`;
  }

  const handleSubmit = async () => {
    if (hasSubmittedRef.current) return;
    const nameParts = formData.name.trim().split(/\s+/);
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || " ";

    let finalStep1Data = step1Data;

    if (
      !step1Data?.agentName ||
      !step1Data?.language ||
      !step1Data?.voice_tone ||
      !step1Data?.url
    ) {
      const localStep1String = localStorage.getItem("step1Data");
      if (localStep1String) {
        finalStep1Data = JSON.parse(localStep1String);
        setStep1Data(finalStep1Data);
      }
    }

    if (
      !finalStep1Data?.agentName ||
      !finalStep1Data?.language ||
      !finalStep1Data?.voice_tone ||
      !finalStep1Data?.url
    ) {
      toast.error("Please complete step 1 before submitting.");
      return;
    }

    const newErrors = {
      name: !formData.name,
      email: !formData.email,
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return null;

    localStorage.setItem("step1Data", JSON.stringify(finalStep1Data));

    setLoading(true);
    try {
      setIsLoading(true);

      if (token && userInfo?.id && finalStep1Data?.voice_tone !== "") {
        const payload = {
          firstname,
          lastname,
          email: formData.email,
          status: 1,
          verified: 1,
        };

        const res = await fetch(`${API_URL}api/users/${userInfo?.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update user");

        const data = await res.json();
        setUser(data);
        localStorage.setItem("authToken", token);
        localStorage.setItem("user_id", userInfo?.id);
        localStorage.removeItem("step1Data");
        localStorage.removeItem("fromStepOne");
        await handleBusinessInfo(userInfo?.id);
        const agentCreated = await handleCreateAgent(userInfo?.id, token);
        hasSubmittedRef.current = true;
        toast.success(
          agentCreated
            ? "Account created successfully!"
            : "Account Already exists!"
        );
        navigate("/dashboard");
        return userInfo?.id ?? null;
      } else if (!token && !userInfo?.id) {
        const newErrors = {
          name: !formData.name,
          email: !formData.email,
          password: !formData.password || formData.password.length < 8,
        };
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) {
          setIsLoading(false);
          return null;
        }

        const response = await fetch(`${API_URL}api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstname,
            lastname,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Registration failed");
        }

        const data = await response.json();
        localStorage.setItem("authToken", data.access_token);
        localStorage.setItem("user_id", data.id);

        const userRes = await fetch(`${API_URL}api/users/${data.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        if (!userRes.ok) {
          throw new Error("Failed to fetch user details after registration");
        }

        const fullUser = await userRes.json();
        setUser(fullUser);
        await handleBusinessInfo(data.id);
        const agentCreated = await handleCreateAgent(
          data.id,
          data.access_token
        );
        hasSubmittedRef.current = true;
        toast.success(
          agentCreated
            ? "Account created successfully!"
            : "Account Already exists!"
        );
        navigate("/dashboard");
        localStorage.removeItem("step1Data");
        setIsLoading(false);
        return data.id;
      }
    } catch (error: any) {
      console.error("Submit Error:", error);
      toast.error(error.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (user_id: string, access_token: string) => {
    if (!user_id) {
      console.error("User ID not found in localStorage");
      return;
    }

    try {
      setIsLoading(true);
      setLoading(true);
      // const audioBase1 = audioBuffer1 ? await arrayBufferToBase64(audioBuffer1) : null;
      // const audioBase2 = audioBuffer2 ? await arrayBufferToBase64(audioBuffer2) : null;
      // if (!audioBase1 || !audioBase2) throw new Error("Missing audio base64 strings");
      // // const stringAudio1 = audioBase1?.toString();
      // // const stringAudio2 = audioBase2?.toString();
      // console.log("audioBase1 length:", audioBase1?.length);
      // console.log("audioBase1 preview:", audioBase1?.slice(0, 100)); // Just to verify content

      // 🔍 First check if agent exists
      const existingRes = await fetch(`${API_URL}api/agents/${user_id}`);
      if (existingRes.ok) {
        const agent = await existingRes.json();
        if (agent && agent.id) {
          console.log("Agent already exists. Skipping creation.");
          return false;
        }
      }
      const response = await fetch(`${API_URL}api/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          agent_name: step1Data?.agentName,
          language_id: step1Data?.language,
          voice_id: step1Data?.voice_tone,
          // audio1: audioBase1.slice(0, 100),
          // audio2: audioBase2.slice(0, 100),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Agent creation failed");
      }

      await fetch(`${API_URL}api/users/${user_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 1, verified: 1 }),
      });
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Create Agent Error:", error);
      const res = await fetch(`${API_URL}api/users/${user_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 0, verified: 0 }),
      });
      console.log("deactivated user", res);
      setIsLoading(false);
      return false;
      // toast.warning("Agent not created !");
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessInfo = async (userId?: string) => {
    const selectedLanguage = languages?.find(
      (lang) => lang.id == step1Data.language
    );
    console.log("selectedLanguage", selectedLanguage);
    try {
      if (!userId) {
        console.error("User ID is required to create business info");
        return;
      }
      // Check if business info already exists
      const checkRes = await fetch(`${API_URL}api/businessinfos/${userId}`);
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (existing?.id) {
          console.log("Business info already exists. Skipping.");
          setBusinessinfo(existing);
          return existing;
        }
      }

      const response = await fetch(`${API_URL}api/businessinfos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          query: step1Data?.url,
          language: selectedLanguage?.code || "en",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Business info creation failed");
      }

      const data = await response.json();
      console.log("Business info created:", data);
      setBusinessinfo(data);
      return data;
    } catch (error: any) {
      console.error("Business Info Error:", error);
    }
  };
  console.log("businessinfo", businessinfo);
  // const nextStep = () => {
  //   if (activeStep === 0) {
  //     const { agentName, language, voice_tone, url } = step1Data;
  //     const newErrors = {
  //       agentName: !agentName,
  //       language: !language,
  //       voice_tone: !voice_tone,
  //       url: !url,
  //     };
  //     setErrors(newErrors);
  //     if (Object.values(newErrors).some(Boolean)) return;
  //   }

  //   if (activeStep === 2) {
  //     const { name, email, password } = formData;
  //     const newErrors = {
  //       name: !name,
  //       email: !email,
  //       password: !password,
  //     };
  //     setErrors(newErrors);
  //     if (Object.values(newErrors).some(Boolean)) return;

  //     return;
  //   }

  //   setActiveStep((prev) => prev + 1);
  // };

  // const nextStep = () => {
  //   if (activeStep === 0) {
  //     const { agentName, language, voice_tone, url } = step1Data;
  //     const newErrors = {
  //       agentName: !agentName,
  //       language: !language,
  //       voice_tone: !voice_tone,
  //       url: !url,
  //     };
  //     setErrors(newErrors);
  //     if (Object.values(newErrors).some(Boolean)) return;

  //     setStep2Visited(true);
  //     localStorage.setItem("step1Data", JSON.stringify(step1Data));
  //   }

  //   if (activeStep === 2) {
  //     const { name, email, password } = formData;
  //     const newErrors = {
  //       name: !name,
  //       email: !email,
  //       password: !password,
  //     };
  //     setErrors(newErrors);
  //     if (Object.values(newErrors).some(Boolean)) return;

  //     return;
  //   }

  //   setActiveStep((prev) => prev + 1);
  // };
  const nextStep = async () => {
    console.log("=== nextStep triggered ===");
    console.log("Current Step:", activeStep);
    console.log("Token:", token);
    console.log("Step1 Data:", step1Data);

    if (activeStep === 0) {
      const { agentName, language, voice_tone, url } = step1Data;
      const newErrors = {
        agentName: !agentName,
        language: !language,
        voice_tone: !voice_tone,
        url: !url,
      };

      console.log("Step 1 validation errors:", newErrors);

      setErrors(newErrors);
      if (Object.values(newErrors).some(Boolean)) {
        console.log("Step 1 has errors, aborting step transition.");
        return;
      }

      console.log("Step 1 passed. Moving to Step 2...");
      localStorage.setItem("step1Data", JSON.stringify(step1Data));
      setActiveStep((prev) => prev + 1);
      return;
    }

    if (activeStep === 1) {
      const isStep1Complete =
        step1Data?.agentName?.trim() &&
        step1Data?.language?.trim() &&
        step1Data?.voice_tone?.trim() &&
        step1Data?.url?.trim();

      console.log("Step 1 Complete:", isStep1Complete);

      if (token && isStep1Complete) {
        console.log("Token and Step1Data exist, calling handleSubmit()");
        setLoading(true);
        await handleSubmit();
        setLoading(false);
        return;
      }

      console.log(
        "Skipping handleSubmit — either no token or step1Data incomplete"
      );
      setActiveStep((prev) => prev + 1);
      return;
    }

    if (activeStep === 2) {
      const { name, email, password } = formData;
      const newErrors = {
        name: !name,
        email: !email,
        password: !password,
      };

      console.log("Step 3 Form Errors:", newErrors);

      setErrors(newErrors);
      if (Object.values(newErrors).some(Boolean)) {
        console.log("Step 3 has errors, not proceeding.");
        return;
      }

      console.log("Step 3 passed validation.");
      return;
    }

    console.log("No matching step condition.");
  };

  // async function handleVoice(voice_id: string, text: string) {
  //   try {
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

  //     const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
  //     const audioUrl1 = URL.createObjectURL(blob);
  //     setAudioUrl1(audioUrl1); // Use for playback
  //   } catch (err) {
  //     console.error("Error:", err);
  //   }
  // }
  // async function handleVoice2(voice_id: string, text: string) {
  //   try {
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

  //     const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
  //     const audioUrl2 = URL.createObjectURL(blob);
  //     setAudioUrl2(audioUrl2); // Use for playback
  //   } catch (err) {
  //     console.error("Error:", err);
  //   }
  // }

  const stepComponents = [
    <div key="step1" className="w-full md:px-10">
      <Step1
        handleGoogleLogin={() => handleGoogleLogin(false)} // ❌ No auto-submit
        voices={voices}
        languages={languages}
        step1Data={step1Data}
        setStep1Data={setStep1Data}
        errors={errors}
        setErrors={setErrors}
      />
    </div>,
    <div key="step2" className="w-full md:px-10">
      <Step2 voices={voices} selectedVoice={step1Data?.voice_tone} />
    </div>,
    <div key="step3" className="w-full md:px-10">
      <Step3
        handleGoogleLogin={() => handleGoogleLogin(true)} // ✅ Set auto-submit flag
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
      />
    </div>,
  ];

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  //const text = `Hi, my name is ${step1Data.agentName}, and I'm here to assist you. How can I help you today?`;

  // console.log('text2', text2);
  // console.log("audiourl", audioUrl1);
  // console.log("audiour2", audioUrl2);
  // console.log('audiobuffer', audioBuffer1);
  // console.log('audiobuffer2', audioBuffer2);
  return (
    <div
      className={cn(
        "flex relative justify-center max-w-3xl md:max-w-7xl mx-auto"
      )}
    >
      <div
        className={`${
          isLoading ? "flex" : "hidden"
        } absolute w-full h-full bg-white/50 z-10 justify-center items-center`}
      >
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-[50px] h-[50px] text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
      </div>
      <Card className="overflow-hidden p-0 border-none rounded-none shadow-none w-full ">
        <CardContent className="grid p-0 md:grid-cols-2 ">
          <form className="p-6 md:pl-10 md:py-12 md:pr-26 self-center relative h-full">
            <div className="flex flex-col gap-1 items-center ">
              <div className="flex items-center justify-between  mb-6 bg-[#F5F6F9] p-3 rounded-lg w-full">
                {steps.map((step, index) => (
                  <>
                    {/* Step Container */}
                    <div
                      key={index}
                      className="flex items-center justify-center cursor-pointer"
                      onClick={() =>
                        index <= activeStep && setActiveStep(index)
                      }
                    >
                      <div
                        className={`font-bold step-title ${
                          index <= activeStep
                            ? "text-[#5222FF] font-bold"
                            : "text-[#2B3674] font-normal"
                        }`}
                      >
                        {step}
                      </div>
                    </div>

                    {/* Progress Bar (Placed outside the step div but inside the same .map) */}
                    {index < steps.length - 1 && (
                      <div
                        key={`bar-${index}`}
                        className={`flex-1 w-full h-[2px] mx-2 ${
                          index < activeStep ? "bg-[#5222FF]" : "bg-[#94A3B8]"
                        }`}
                      ></div>
                    )}
                  </>
                ))}
              </div>
              {/* Current Step Content */}
              {stepComponents[activeStep]}

              {/* Navigation Buttons */}
              <div className="flex flex-col justify-center gap-4 mt-4 w-full md:px-10">
                <div>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (activeStep === steps.length - 1) {
                        const newErrors: Partial<
                          Record<"name" | "email" | "password", boolean>
                        > = {};

                        if (!formData.name.trim()) newErrors.name = true;
                        if (!formData.email.trim()) newErrors.email = true;
                        if (!formData.password || formData.password.length < 8)
                          newErrors.password = true;

                        if (Object.keys(newErrors).length > 0) {
                          setErrors(newErrors);
                          return; // ❌ prevent loading and submit
                        }
                        setLoading(true);
                        handleSubmit();
                      } else if (activeStep === 0) {
                        setLoading(true);
                        await handleBusinessInfo();
                        setLoading(false);
                        nextStep();
                      } else {
                        nextStep();
                        setLoading(false);
                      }
                    }}
                    className="w-full h-10 rounded-[8px] cursor-pointer bg-default-purple hover:bg-[#2261ff] flex items-center justify-center"
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
                    ) : activeStep === steps.length - 1 ? (
                      "Get Started"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>

                <div>
                  {/* Back Button */}
                  {activeStep > 0 && (
                    <Button
                      type="button"
                      onClick={prevStep}
                      className="w-full h-10 rounded-[8px] cursor-pointer bg-gray-300 text-black hover:bg-gray-400 flex items-center justify-center"
                    >
                      Back
                    </Button>
                  )}
                </div>
              </div>

              {/* Additional 3 Progress Bars at Bottom */}
              <div className="sm:flex justify-between mt-6 w-3xs absolute bottom-4 gap-2 hidden">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-[13px] w-1/3 rounded-2xl ${
                      index <= activeStep ? "bg-[#5222FF]" : "bg-[#F5F6F9]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </form>

          {/* right image section */}
          <AuthRightSec />
          {/* right image section end */}
        </CardContent>
      </Card>
    </div>
  );
};
