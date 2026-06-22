import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

type HashtagTextareaProps = {
  services: string[];
  setServices: (tags: string[]) => void;
};

export default function HashtagTextarea({
  services,
  setServices,
}: HashtagTextareaProps) {
  const [tags, setTags] = useState<string[]>(services || []);
  const [inputValue, setInputValue] = useState<string>("");

  // Sync tags to parent every time tags update
  useEffect(() => {
    setServices(tags);
  }, [tags, setServices]);

  // Update local tags if `services` from props changes
  useEffect(() => {
    setTags(services);
  }, [services]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === "Enter" || e.key === " ") && inputValue.trim()) {
      const words = inputValue.split(" ");
      let newTags = [...tags];
      if (newTags.length >= 5) {
        toast.error("You can only add up to 5 services.");
        return;
      }
      words.forEach((word) => {
        const trimmed = word.trim();
        if (
          (trimmed.startsWith("#") ||
            trimmed.startsWith("+") ||
            trimmed.length > 0) &&
          !newTags.includes(trimmed) &&
          newTags.length < 10
        ) {
          newTags.push(trimmed);
        }
      });

      setTags(newTags);
      setInputValue("");
      e.preventDefault();
    }
  };

  const removeTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full p-2 border rounded-[8px] relative min-h-[100px]">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags?.map((tag, index) => (
            <Badge
              key={index}
              className="border-[1px] border-gray-400 bg-white text-gray-800 px-2 py-1 rounded-[4px] flex items-center gap-1"
            >
              <div
                onClick={() => removeTag(index)}
                className="cursor-pointer rounded hover:bg-gray-300 transition-colors"
                style={{ padding: "2px" }}
              >
                <X className="w-[12px] h-[12px]" />
              </div>
              {tag}
            </Badge>
          ))}
        </div>

        <Textarea
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type and press space or Enter to add..."
          className="w-full resize-none border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none p-0"
        />
      </div>
    </div>
  );
}
