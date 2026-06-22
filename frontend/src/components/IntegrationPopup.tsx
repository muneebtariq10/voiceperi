import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  userInfo: { id: string } | null;
  setUserInfo?: React.Dispatch<React.SetStateAction<UserInfo | null>>;
};

interface UserInfo {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
  event_id: string;
}
type EventType = {
  eventTypeGroups: {
    eventTypes: any[];
  }[];
};
export const Popup: React.FC<PopupProps> = ({ isOpen, onClose, userInfo }) => {
  const [key, setKey] = useState("");
  // const [userInfo, setUserInfo] = useState<DecodedToken | null>(null)
  const [isNextTab, setIsNextTab] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<EventType | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string | null>(null);

  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  async function handleGetEvents(key: string) {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}api/integration?key=${encodeURIComponent(key)}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const eventsData = await response.json();
      setEvents(eventsData?.data);
      setIsNextTab(true);
      setIsLoading(false);
      console.log("eventsData", eventsData);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      if (error instanceof Error) {
        toast.error(`${error.message}`);
        setIsLoading(false);
      } else {
        toast.error("An unknown error occurred");
        setIsLoading(false);
      }
    }
  }

  async function handleSaveEvents(event: any) {
    try {
      if (!userInfo) {
        return;
      }

      setIsLoading(true);

      const response = await fetch(
        `${API_URL}api/integration?user-id=${userInfo?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cal_key: key.toString(),
            event_id: (event?.id).toString(),
            title: (event?.title).toString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const eventsData = await response.json();
      setIsLoading(false);
      console.log("eventsData", eventsData);
      toast.success("Event Saved");
      setKey("");
      onClose();
    } catch (error) {
      console.error("Failed to save event:", error);
      if (error instanceof Error) {
        toast.error(`${error.message}`);
      } else {
        toast.error("An unknown error occurred");
      }
      setIsLoading(false);
    }
  }

  console.log("key", userInfo);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setKey("");
        onClose();
        setIsNextTab(false);
      }}
    >
      <div
        className={`${
          isLoading ? "flex" : "hidden"
        } absolute w-full h-full bg-white/50 z-10 justify-center items-center`}
      >
        {/* <Loader className={`${isLoading ? 'flex' : 'hidden'} w-[300px] h-[300px] animate-spin  text-muted-foreground`} /> */}
      </div>
      <DialogContent className="p-6 rounded-lg shadow-lg w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-primary">
            <DialogClose className="cursor-pointer">
              Cal.com Integration
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        <hr className="w-full bg-[#CBD4E1]" />

        {/* <hr className="w-full bg-[#CBD4E1]" />
        
        <hr className="w-full bg-[#CBD4E1]" /> */}

        <div className={`${isNextTab ? "hidden" : "block"}`}>
          <div className="flex flex-col items-start py-1 w-full gap-y-2">
            <label
              htmlFor="key"
              className={`text-[16px] md:text-[18px] font-[500]  ${
                error ? "text-red-500" : ""
              }`}
            >
              API key
            </label>
            <Input
              className={error ? "border-red-500" : ""}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                if (e.target.value.trim()) {
                  setError(false); // remove error once user types a valid key
                }
              }}
              id="key"
              placeholder="Enter your API key"
            />
            {error && (
              <span className="text-red-500 text-sm">API key is required</span>
            )}
          </div>

          <div className=" w-full flex justify-center mt-[20px]">
            <Button
              onClick={() => {
                if (!key.trim()) {
                  setError(true);
                  return;
                }
                setError(false);
                handleGetEvents(key); // optional: reset loading
              }}
              className="w-[100px] rounded-[8px] cursor-pointer bg-[#5222FF] hover:bg-[#2261ff]"
            >
              {isLoading ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-[28px] h-[28px] text-gray-600 animate-spin  fill-[#fff]"
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
                "Next"
              )}
            </Button>
          </div>
        </div>
        <div className={`${!isNextTab ? "hidden" : "block"}`}>
          <div className="flex flex-col items-start py-1 w-full gap-y-2">
            <label
              htmlFor="profile"
              className="text-[16px] md:text-[18px] font-[500] mb-[0px] text-default"
            >
              Select Event
            </label>
            {/* <Input  id="profile" placeholder="Not Set" /> */}
            <Select onValueChange={(value) => setSelectedEvents(value)}>
              <SelectTrigger className="w-full !h-[40px] border rounded-[8px]">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                {(events?.eventTypeGroups[0]?.eventTypes || []).map(
                  (event: any) => (
                    <SelectItem key={event.id} value={event}>
                      {event.title}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className=" w-full flex justify-center mt-[20px]">
            {/* <Button className="w-[100px] rounded-[8px] cursor-pointer bg-[#5222FF] hover:bg-[#2261ff]">Submit</Button> */}
            <Button
              onClick={() => {
                if (!selectedEvents) {
                  setError(true);
                  return;
                }
                setError(false);
                handleSaveEvents(selectedEvents); // optional: reset loading
              }}
              className="w-[100px] rounded-[8px] cursor-pointer bg-[#5222FF] hover:bg-[#2261ff]"
            >
              {isLoading ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-[28px] h-[28px] text-gray-600 animate-spin  fill-[#fff]"
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
      </DialogContent>
    </Dialog>
  );
};
