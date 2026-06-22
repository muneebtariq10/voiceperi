import { Moon } from "lucide-react";

export default function StatusInput() {
  return (
    <div className="flex h-[45px] w-full  items-center gap-2 px-3 py-1.5 rounded-[8px] bg-gray-100 text-gray-500 border border-gray-300 ">
      <Moon className="w-4 h-4" />
      <span className="text-sm">Closed</span>
    </div>
  );
}
