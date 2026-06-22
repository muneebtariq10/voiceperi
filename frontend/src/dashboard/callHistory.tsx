import { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "@/components/DataTable";
import { Popup } from "@/components/detailpopup";
import { jwtDecode } from "jwt-decode";
import { AppUser } from "@/AppContext";
type Data = {
  id: number;
  time: string;
  duration: string;
  cost: string;
  reason: string;
  status: string;
  sentiment: string;
  success: boolean;
  latency: string;
  transcription: { role: string; content: string; duration: string }[];
  summary?: string;
  recording_url?: string;
};
interface DecodedToken {
  firstname?: string;
  email?: string;
  sub?: string;
  // add any custom fields your token includes
}

const CallHistory = () => {
  const { user } = AppUser();
  const [callHistoryData, setCallHistoryData] = useState<Data[]>([]);
  const [selectedRow, setSelectedRow] = useState<Data | null>(null);

  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  console.log("userInfo", userInfo?.sub);

  useEffect(() => {
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        console.log("decoded", decoded);

        setUserInfo(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const id = user?.role == "user" ? `?id=${userInfo?.sub}` : "";

      try {
        //const response = await axios.get(`${process.env.VITE_API_BASE_URL}api/call-history/${userInfo?.sub}`);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}api/call-history${id}`
        );
        const apiData = response.data;
        console.log("response", response.data);
        const formattedData: Data[] = apiData.map(
          (
            item: {
              start_timestamp: number;
              recording_url: string;
              end_timestamp: number;
              call_cost: { combined_cost: number };
              disconnection_reason?: string;
              call_status: string;
              call_analysis?: {
                call_summary?: string;
                user_sentiment?: string;
                call_successful?: boolean;
              };
              latency?: { e2e?: { p50?: number } };
              transcript_object?: any;
              agentName?: string;
              userEmail?: string;
              userFirstName?: string;
              userLastName?: string;
            },
            index: number
          ) => {
            let parsedTranscriptObject = [];
            try {
              parsedTranscriptObject = item.transcript_object
                ? item.transcript_object
                : [];
            } catch (error) {
              console.warn("Failed to parse transcript_object:", error);
            }
            return {
              id: index + 1, // or item.id if you want UUID
              time: formatTimestamp(item.start_timestamp),
              duration: calculateDuration(
                item.start_timestamp,
                item.end_timestamp
              ),
              cost: `$${(item.call_cost.combined_cost / 100).toFixed(4)}`,
              reason: formatReason(item.disconnection_reason || "Unknown"),
              status: item.call_status,
              recording_url: item.recording_url,
              sentiment: item.call_analysis?.user_sentiment || "Neutral",
              summary: item.call_analysis?.call_summary || "Summary",
              success: item.call_analysis?.call_successful || false,
              latency: `${(item.latency?.e2e?.p50 || 0).toFixed(2)} ms`,
              transcription: formatTranscription(parsedTranscriptObject),
              agentName: item.agentName,
              userEmail: item.userEmail,
              userFirstName: item.userFirstName,
              userLastName: item.userLastName,
            };
          }
        );
        console.log("formattedData", formattedData);
        setCallHistoryData(formattedData);
        //setCallHistoryData(response.data);
      } catch (error) {
        console.error("Error fetching call history:", error);
      }
    };
    if (userInfo?.sub) {
      fetchData();
    }
  }, [userInfo?.sub]);
  return (
    <div className="w-full">
      <DataTable callHistoryData={callHistoryData} userRole={user?.role} />
      {selectedRow && (
        <Popup
          isOpen={true}
          onClose={() => setSelectedRow(null)}
          selectedRow={selectedRow as Data}
        />
      )}
    </div>
  );
};
function calculateDuration(start: number, end: number): string {
  const totalSeconds = Math.floor((end - start) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
function formatTimestamp(timestamp: number | string): string {
  // Convert string timestamp to a number
  const numericTimestamp =
    typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;

  if (isNaN(numericTimestamp)) {
    return "Invalid Date"; // Handle invalid timestamps
  }

  const date = new Date(numericTimestamp);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
function formatReason(reason: string): string {
  return reason
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
/*function formatTranscription(transcriptObject: Array<{
    role: string;
    content: string;
    words: Array<{ word: string; start: number; end: number }>;
}>): Array<{ role: string; content: string; duration: string }> {
    if (!transcriptObject) return [];

    return transcriptObject?.map((message) => {
        let rawDurationSeconds: number | null = null;

        if (message.words && message.words.length > 0) {
            const start = message.words[0].start;
            const end = message.words[message.words.length - 1].end;
            rawDurationSeconds = end - start;
        }

        return {
            role: message.role.replace(/\b\w/g, (char: string) => char.toUpperCase()),
            content: message.content,
            duration: prettyDuration(rawDurationSeconds),
        };
    });
}*/
function formatTranscription(
  transcriptObject: any
): Array<{ role: string; content: string; duration: string }> {
  if (!transcriptObject || !Array.isArray(transcriptObject)) {
    console.warn("Invalid transcriptObject:", transcriptObject);
    return [];
  }

  return transcriptObject.map((message) => {
    let rawDurationSeconds: number | null = null;

    if (message.words && message.words.length > 0) {
      const start = message.words[0].start;
      const end = message.words[message.words.length - 1].end;
      rawDurationSeconds = end - start;
    }

    return {
      role: message.role.replace(/\b\w/g, (char: string) => char.toUpperCase()),
      content: message.content,
      duration: prettyDuration(rawDurationSeconds),
    };
  });
}

function prettyDuration(durationInSeconds: number | null): string {
  if (durationInSeconds === null) return "0:00";

  const totalSeconds = Math.round(durationInSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default CallHistory;
