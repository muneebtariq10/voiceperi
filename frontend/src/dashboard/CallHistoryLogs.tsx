import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { GenericDataTable } from "@/components/GenericDataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";

interface LogEntry {
  id: number;
  log_id: string;
  start: string;
  end: string;
  records: number;
  status: string;
  error?: string;
  createdAt: string;
}

const CallHistoryLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    const fetchLogs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}api/logs/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const rawLogs = response.data;
        console.log(rawLogs);
        const formattedLogs = rawLogs.map((log: any, index: number) => {
          return {
            id: index + 1,
            log_id: log.log_id,
            start: formatTimestamp(log.start_timestamp),
            end: formatTimestamp(log.end_timestamp),
            records: log.records_loaded,
            status: capitalize(log.status),
            error: log.error_message || "None",
            createdAt: formatTimestamp(log.createdAt),
          };
        });

        setLogs(formattedLogs);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

  const columns: ColumnDef<LogEntry>[] = [
    { accessorKey: "id", header: "Index" },

    { accessorKey: "start", header: "Logs Start Time" },
    { accessorKey: "end", header: "Logs End Time" },
    { accessorKey: "records", header: "Logs Synced" },
    { accessorKey: "status", header: "Status Details" },
    { accessorKey: "error", header: "Error" },
    { accessorKey: "createdAt", header: "Synced At" },
  ];

  return (
    <div className="w-full">
      <GenericDataTable
        data={logs}
        columns={columns}
        title="Call Logs Sync"
        searchKeys={["status", "error"]}
        popupComponent={(row, onClose) => (
          <AlertDialog open onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Log Details</AlertDialogTitle>
                <AlertDialogDescription>
                  <p>
                    <strong>Log ID:</strong> {row.log_id}
                  </p>
                  <p>
                    <strong>Status:</strong> {row.status}
                  </p>
                  <p>
                    <strong>Error:</strong> {row.error}
                  </p>
                  <p>
                    <strong>Synced At:</strong> {row.createdAt}
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      />
    </div>
  );
};

// Function to convert timestamp to readable format
function formatTimestamp(timestamp: number | string): string {
  let date: Date;

  if (typeof timestamp === "string") {
    // If it's a string and looks like an ISO date, parse directly
    if (timestamp.includes("T")) {
      date = new Date(timestamp);
    } else {
      // Otherwise, try to parse it as milliseconds
      const ms = parseInt(timestamp, 10);
      date = new Date(ms);
    }
  } else {
    // It's already a number (milliseconds)
    date = new Date(timestamp);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid Date";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export default CallHistoryLogs;
