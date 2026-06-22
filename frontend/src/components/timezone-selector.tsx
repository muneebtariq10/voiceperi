// "use client";

// import * as React from "react";
// import { Check, ChevronsUpDown } from "lucide-react";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";

// import { allTimezones } from "react-timezone-select";
// import { cn } from "@/lib/utils";

// interface ComboboxDemoProps {
//   timezone: string; // You pass timezone as a prop
//   setTimezone: React.Dispatch<React.SetStateAction<string>>; // Function to update the timezone state
//   placeholder?: string;
// }

// export function ComboboxDemo({
//   placeholder = "Select Timezone",
//   setTimezone,
//   timezone,
// }: ComboboxDemoProps) {
//   const [open, setOpen] = React.useState(false);

//   // Memoize the timezones list to prevent unnecessary re-renders
//   // const timezones = React.useMemo(() => {
//   //   const now = new Date();
//   //   return Object.entries(allTimezones).map(([tz, label]) => {
//   //     const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
//   //     const offsetHours =
//   //       -(tzDate.getTime() - now.getTime()) / (1000 * 60 * 60);
//   //     const hours = Math.floor(offsetHours);
//   //     const minutes = Math.abs(Math.round((offsetHours % 1) * 60));
//   //     const formattedOffset = `${hours >= 0 ? "+" : "-"}${String(
//   //       Math.abs(hours)
//   //     ).padStart(2, "0")}:${String(minutes).padStart(2, "00")}`;

//   //     return {
//   //       value: tz,
//   //       label: `(GMT${formattedOffset}) ${label}`,
//   //     };
//   //   });
//   // }, []);
//   const timezones = React.useMemo(() => {
//     const now = new Date();

//     // First generate a list with offset value for sorting
//     const timezoneList = Object.entries(allTimezones).map(([tz, label]) => {
//       const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
//       const offsetHours =
//         -(tzDate.getTime() - now.getTime()) / (1000 * 60 * 60);

//       const hours = Math.floor(offsetHours);
//       const minutes = Math.abs(Math.round((offsetHours % 1) * 60));
//       const formattedOffset = `${hours >= 0 ? "+" : "-"}${String(
//         Math.abs(hours)
//       ).padStart(2, "0")}:${String(minutes).padStart(2, "00")}`;

//       return {
//         value: tz,
//         label: `(GMT ${formattedOffset}) ${label}`,
//         sortOffset: offsetHours,
//       };
//     });

//     // Sort by numeric GMT offset (smallest to largest)
//     timezoneList.sort((a, b) => a.sortOffset - b.sortOffset);

//     return timezoneList;
//   }, []);

//   const handleSelect = (timezoneValue: string) => {
//     const selectedTimezone = timezones.find((tz) => tz.value === timezoneValue);
//     if (!selectedTimezone) return;

//     if (timezone === selectedTimezone.label) {
//       setTimezone("");
//     } else {
//       setTimezone(selectedTimezone.label);
//     }
//     setOpen(false);
//   };

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className="w-full justify-between"
//         >
//           {timezone || placeholder}{" "}
//           {/* Use the timezone prop to display selected timezone */}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[350px] p-0 max-h-fit overflow-y-auto">
//         <Command>
//           <CommandInput placeholder="Search timezone..." />
//           <CommandList>
//             <CommandEmpty>No timezone found.</CommandEmpty>
//             <CommandGroup>
//               {timezones.map((tz) => (
//                 <CommandItem
//                   key={tz.value}
//                   value={tz.value}
//                   onSelect={() => handleSelect(tz.value)} // Select the timezone
//                 >
//                   {tz.label}
//                   <Check
//                     className={cn(
//                       "ml-auto h-4 w-4",
//                       timezone === tz.label ? "opacity-100" : "opacity-0"
//                     )}
//                   />
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

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

import { allTimezones } from "react-timezone-select";
import { cn } from "@/lib/utils";

interface ComboboxDemoProps {
  timezone: string; // You pass timezone ID like 'Asia/Karachi'
  setTimezone: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
}

export function ComboboxDemo({
  placeholder = "Select Timezone",
  setTimezone,
  timezone,
}: ComboboxDemoProps) {
  const [open, setOpen] = React.useState(false);

  // Get options using react-timezone-select helper
  const timezonesMap = allTimezones;

  const timezones = React.useMemo(() => {
    return Object.entries(timezonesMap)
      .map(([tz, label]) => {
        const date = new Date();

        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          timeZoneName: "shortOffset", // modern browsers only
        });

        const parts = formatter.formatToParts(date);
        const offsetPart = parts.find((p) => p.type === "timeZoneName");

        let offsetLabel = offsetPart?.value || "";
        let offsetMatch = offsetLabel.match(/GMT([+-]\d{1,2}):?(\d{2})?/);

        let offsetHours = 0;
        if (offsetMatch) {
          const hours = parseInt(offsetMatch[1], 10);
          const minutes = parseInt(offsetMatch[2] || "0", 10);
          offsetHours = hours + minutes / 60;
        }

        const formattedOffset = `GMT ${offsetHours >= 0 ? "+" : "-"}${String(
          Math.abs(Math.floor(offsetHours))
        ).padStart(2, "0")}:${String(
          Math.abs(Math.round((offsetHours % 1) * 60))
        ).padStart(2, "0")}`;

        const entry = {
          value: tz,
          label: `(${formattedOffset}) ${label}`,
          sortOffset: offsetHours,
        };

        console.log("Timezone Entry:", entry); // ✅ clean debug
        return entry;
      })
      .sort((a, b) => a.sortOffset - b.sortOffset);
  }, []);

  const selectedTz = timezones.find((tz) => tz.value === timezone);

  const handleSelect = (timezoneValue: string) => {
    setTimezone(timezoneValue); // store only the ID like 'Asia/Karachi'
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedTz?.label || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 max-h-[300px] overflow-y-auto">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {timezones.map((tz) => (
                <CommandItem
                  key={tz.value}
                  value={tz.value}
                  onSelect={() => handleSelect(tz.value)}
                >
                  {tz.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      timezone === tz.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
