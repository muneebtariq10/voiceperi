import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function FilterDropdown({
  options,
  selectedValue,
  setSelectedValue,
  placeholder = "Select...",
}: {
  options: string[];
  selectedValue: string;
  setSelectedValue: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            className="border rounded-[8px] bg-transparent"
          />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                >
                  {option}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedValue === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
              <CommandItem
                value=""
                onSelect={() => handleSelect("")}
                className="text-muted-foreground"
              >
                Clear Filter
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
