import React from "react";
import {
  Input,
  Popover,
  PopoverHandler,
  PopoverContent,
} from "@material-tailwind/react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function DatePicker() {
  const [date, setDate] = React.useState(new Date());
  const today = new Date(); // Get today's date
  

  return (
    <div className="p-24">
      <Popover placement="bottom">
        <PopoverHandler>
          <button className="w-full text-left">
            <Input
              label="Select a Date"
              onChange={() => null}
              value={date ? format(date, "PPP") : ""}
              readOnly
            />
          </button>
        </PopoverHandler>
        <PopoverContent>
          <DayPicker
            animate

            mode="single"
            selected={date}
            onSelect={setDate}

            defaultMonth={today} // Show the current month initially
            modifiers={{ today }} // Mark today as a special day
            modifiersClassNames={{
                today: "bg-[#040b2b] text-white font-bold rounded-full -p-1",
              }}
            classNames={{
                day: "h-9 w-9 p-0 font-normal",
            }}
            disabled={{ after: today }}
            footer={
                date ? `Selected: ${date.toLocaleDateString()}` : "Pick a day."
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
