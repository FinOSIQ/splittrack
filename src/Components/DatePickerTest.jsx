import React, { useState as x } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export default function DatePicker() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  return (
    <div>
        
    </div>
    // <DayPicker
    //     animate
    //     mode="single"
    //     selected={selectedDate}
    //     onSelect={setSelectedDate}
    //     footer={
    //         selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : "Pick a day."
    //     }
    // />
  );
}
