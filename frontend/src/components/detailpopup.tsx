import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckSquare, CloudDownload, Copy, Headphones, PhoneCall, Smile } from "lucide-react";
import { useState } from "react";

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: {
    time: string;
    duration: string;
    cost: string;
    reason: string;
    status: string;
    sentiment: string;
    success: boolean;
    latency: string;
    transcription: { role: string; content: string; duration: string; }[];
    summary?: string;
    recording_url?: string;
  };
};

export const Popup: React.FC<PopupProps> = ({ isOpen, onClose, selectedRow }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="p-6 rounded-lg shadow-lg w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-primary">
            {selectedRow.time}
            <DialogClose className="cursor-pointer">
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        <hr className="w-full bg-[#CBD4E1]" />
        <div className="flex flex-col items-start py-6 w-full gap-y-5">
          <p className="text-sm text-default-gray">Duration: {selectedRow.duration}</p>
          <p className="text-sm text-default-gray">Cost: {selectedRow.cost}</p>
          <div className="flex items-center gap-x-4">
            <audio controls className="w-[340px] h-[40px]">
              <source src={selectedRow.recording_url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            <a
              href="/sample-audio.mp3"
              download="sample-audio.mp3"
              className="flex items-center bg-white text-[#64748B] px-2.5 py-2.5 cursor-pointer rounded-[6px] border border-[#CBD4E1]"
            >
              <CloudDownload size={20} />
            </a>
          </div>
        </div>
        <hr className="w-full bg-[#CBD4E1]" />
        <div className="flex flex-col items-start py-6 w-full gap-y-4">
          <p className="text-xl font-semibold text-primary">Conversation Analysis</p>
          <p className="text-sm font-normal text-default-gray">Preset</p>
          <div className="flex flex-col gap-y-4 w-full">
            <div className="flex flex-row items-center w-full">
              <div className="flex basis-[50%] items-center gap-3">
                <CheckSquare size={19} />
                <span className="text-[16px] font-medium text-primary">Call Successful</span>
              </div>
              <span className="text-sm text-default-gray">• {selectedRow.success ? "Successful" : "Unsuccessful"}</span>
            </div>
            <div className="flex flex-row items-center w-full">
              <div className="flex basis-[50%] items-center gap-3">
                <Headphones size={19} />
                <span className="text-[16px] font-medium text-primary">Call Status</span>
              </div>
              <span className="text-sm text-default-gray">• {selectedRow.status}</span>
            </div>
            <div className="flex flex-row items-center w-full">
              <div className="flex basis-[50%] items-center gap-3">
                <Smile size={19} />
                <span className="text-[16px] font-medium text-primary">User Sentiment</span>
              </div>
              <span className="text-sm text-default-gray">• {selectedRow.sentiment}</span>
            </div>
            <div className="flex flex-row items-center w-full">
              <div className="flex basis-[50%] items-center gap-3">
                <PhoneCall size={19} />
                <span className="text-[16px] font-medium text-primary">Disconnection Reason</span>
              </div>
              <span className="text-sm text-default-gray">• {selectedRow.reason}</span>
            </div>
          </div>
        </div>
        <hr className="w-full bg-[#CBD4E1]" />

        <div className="flex flex-col items-start py-6 w-full gap-y-4">
          <p className="text-xl font-medium text-primary">Summary</p>
          <p className="text-[16px] font-normal text-start text-default-gray">
            {selectedRow.summary}
          </p>
        </div>
        <hr className="w-full bg-[#CBD4E1]" />
        <div className="flex justify-between items-center w-full pt-6 pb-2.5">
          <p className="text-xl font-medium text-default-purple">Transcription</p>
          <button
            onClick={() => {
              const transcriptionText = selectedRow.transcription
                ?.map((entry) => `${entry.role}: ${entry.content}`)
                .join("\n") || "";
              navigator.clipboard.writeText(transcriptionText);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2500);
            }}
            className="cursor-pointer bg-white text-default-purple flex items-center gap-2"
          >
            <Copy size={20} />
            {copied && <span className="text-sm text-default-purple">Copied!</span>}
          </button>

        </div>
        <div className="relative w-full">
          <div className="absolute right-[70%] top-0 w-[30%] h-[2px] bg-default-purple"></div>
          <hr className="w-full h-[2px] bg-[#CBD4E1] border-0" />
        </div>

        <div className="flex flex-col items-start py-6 w-full gap-y-4">
          {selectedRow.transcription?.map((entry, index) => (
            <div key={index} className="flex justify-between items-start w-full gap-x-4">
              <p className="text-[16px] font-normal text-start text-primary">
                {entry.role}: {entry.content}
              </p>
              <p className="text-[16px] font-normal text-primary">
                {entry.duration}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>

  );
};


