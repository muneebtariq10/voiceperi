"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const dayOptions = [
  { label: "Last 7 Days", value: "7-days" },
  { label: "Last 15 Days", value: "15-days" },
  { label: "Last 1 Month", value: "1-month" },
  { label: "Last 1 Year", value: "1-year" },
];

interface DaysSelectorProps {
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  placeholder?: string;
  onCustomDateChange?: (startDate: Date, endDate: Date) => void;
}

export const DaysSelector: React.FC<DaysSelectorProps> = ({
  selectedValue,
  setSelectedValue,
  placeholder = "Select Duration",
  onCustomDateChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const [showCustom, setShowCustom] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  console.log(startDate, endDate);

  const handleSelect = (value: string) => {
    if (value === "custom") {
      setShowCustom(true);
    } else {
      setSelectedValue(value);
      setStartDate(null);
      setEndDate(null);
      setShowCustom(false);
      setOpen(false);
    }
  };

  // const handleCustomApply = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault();
  //   if (startDate && endDate) {
  //     setSelectedValue("7-days");
  //     onCustomDateChange?.(startDate, endDate);
  //     setOpen(false);
  //   }
  // };

  const handleCustomApply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    if (endDate < startDate) {
      toast("End date cannot be earlier than start date.");
      return;
    }

    // Notify parent: custom mode
    setSelectedValue("custom");

    // Send start/end to parent to trigger actual data fetch
    onCustomDateChange?.(startDate, endDate);

    setOpen(false);
  };

  const selectedLabel =
    selectedValue === "custom"
      ? `${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`
      : dayOptions.find((opt) => opt.value === selectedValue)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLabel || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search duration..." />
          <CommandList>
            <CommandEmpty>No duration found.</CommandEmpty>
            <CommandGroup>
              {dayOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedValue === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
              <CommandItem
                value="custom"
                onSelect={() => handleSelect("custom")}
              >
                Custom Duration
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>

        {showCustom && (
          <div className="p-4 border-t space-y-3">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-md"
                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-md"
                value={endDate ? endDate.toISOString().split("T")[0] : ""}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
            <Button
              className="w-full mt-2"
              onClick={(e) => {
                handleCustomApply(e);
              }}
              disabled={!startDate || !endDate}
            >
              Apply
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
