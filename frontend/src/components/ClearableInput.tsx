import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface ClearableInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  type: string;
}

export default function ClearableInput({
  value,
  onChange,
  onClear,
  type,
}: ClearableInputProps) {
  return (
    <div className="relative w-full h-[40px]">
      <Input
        type={type}
        value={value}
        onChange={onChange}
        className="pr-10 h-[40px] w-full"
      />
      {value && (
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          onClick={onClear} // 👈 directly call onClear
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
