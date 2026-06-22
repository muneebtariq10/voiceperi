import { UsersTable } from "@/components/UsersTable";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

interface DecodedToken {
  firstname?: string;
  email?: string;
  sub?: string;
  // add any custom fields your token includes
}
export type UserData = {
  id: number;
  email: string;
  firstname: string;
  google_id: string;
  image: string;
  lastname: string;
  verified: number;
  status: number;
  agent: {
    agent_name: string;
    id: string;
  }[];
  info: { name: string }[];
  createdAt: string;
  updatedAt: string;
};

function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  // const [selectedRow, setSelectedRow] = useState<Data | null>(null);

  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);

  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

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
      try {
        //const response = await axios.get(`${process.env.VITE_API_BASE_URL}api/call-history/${userInfo?.sub}`);
        const response = await axios.get<UserData[]>(
          `${import.meta.env.VITE_API_BASE_URL}api/users/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const apiData = response.data;
        console.log("apiData", apiData);
        // Add selectedRow property to each user
        setUsers(
          apiData.map((user) => ({
            ...user,
            selectedRow: null,
          }))
        );
        // const formattedData: Data[] = apiData.map((item: {
        //     start_timestamp: number; recording_url: string; end_timestamp: number; call_cost: { combined_cost: number }; disconnection_reason?: string; call_status: string; call_analysis?: { call_summary?: string; user_sentiment?: string; call_successful?: boolean }; latency?: { e2e?: { p50?: number } }; transcript_object?: any;
        // }, index: number) => {
        //     let parsedTranscriptObject = [];
        //     try {
        //         parsedTranscriptObject = item.transcript_object ? JSON.parse(item.transcript_object) : [];
        //     } catch (error) {
        //         console.warn('Failed to parse transcript_object:', error);
        //     }
        //     return {
        //         id: index + 1, // or item.id if you want UUID
        //         time: formatTimestamp(item.start_timestamp),
        //         cost: `$${item.call_cost.combined_cost.toFixed(2)}`,
        //         status: item.call_status,
        //         recording_url: item.recording_url,
        //         sentiment: item.call_analysis?.user_sentiment || "Neutral",
        //         summary: item.call_analysis?.call_summary || "Summary",
        //         success: item.call_analysis?.call_successful || false,
        //         latency: `${(item.latency?.e2e?.p50 || 0).toFixed(2)} ms`,
        //     };
        // });
        // console.log('formattedData', formattedData);
        // setCallHistoryData(formattedData);
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
      <UsersTable userData={users} setUsers={setUsers} />
    </div>
  );
}

export default Users;
