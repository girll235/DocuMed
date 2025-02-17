import { useEffect } from "react"
import { addDays, format, parse, isWithinInterval } from "date-fns"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Doctor } from "@/types"

interface DateTimeSelectorProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  workingHours: Doctor['workingHours'];
}

export const DateTimeSelector = ({ 
  date, 
  time, 
  onDateChange, 
  onTimeChange,
  workingHours = {} // Provide default empty object
}: DateTimeSelectorProps) => {
  const minDate = format(new Date(), "yyyy-MM-dd")
  const maxDate = format(addDays(new Date(), 30), "yyyy-MM-dd")

  const getWorkingHoursForDay = (selectedDate: string) => {
    if (!selectedDate) return null;
    
    const dayName = format(new Date(selectedDate), 'EEEE').toLowerCase();
    const hours = workingHours[dayName];

    if (!hours?.start || !hours?.end) {
      return {
        start: "09:00",
        end: "17:00"
      };
    }

    return hours;
  }

  const validateTimeSlot = (selectedTime: string) => {
    if (!date || !selectedTime) return true;

    const hours = getWorkingHoursForDay(date);
    if (!hours) return false;

    const selectedDateTime = parse(selectedTime, "HH:mm", new Date());
    const startTime = parse(hours.start, "HH:mm", new Date());
    const endTime = parse(hours.end, "HH:mm", new Date());

    return isWithinInterval(selectedDateTime, { start: startTime, end: endTime });
  }

  // Update time if it becomes invalid with new date selection
  useEffect(() => {
    if (date && time && !validateTimeSlot(time)) {
      const hours = getWorkingHoursForDay(date);
      if (hours) {
        onTimeChange(hours.start);
      }
    }
  }, [date]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="date">Appointment Date</Label>
        <Input
          type="date"
          id="date"
          min={minDate}
          max={maxDate}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          required
          className="input-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">Appointment Time</Label>
        <Input
          type="time"
          id="time"
          min={date ? getWorkingHoursForDay(date)?.start : "09:00"}
          max={date ? getWorkingHoursForDay(date)?.end : "17:00"}
          step="1800"
          value={time}
          onChange={(e) => {
            if (validateTimeSlot(e.target.value)) {
              onTimeChange(e.target.value);
            }
          }}
          required
          disabled={!date}
          className="input-primary"
        />
        {date && getWorkingHoursForDay(date) && (
          <p className="text-sm text-gray-500 mt-1">
            Available hours: {getWorkingHoursForDay(date)?.start} - {getWorkingHoursForDay(date)?.end}
          </p>
        )}
      </div>
    </div>
  )
}