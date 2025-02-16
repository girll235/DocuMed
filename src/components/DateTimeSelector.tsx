import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { addDays, format } from "date-fns"
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
  workingHours 
}: DateTimeSelectorProps) => {
  const minDate = format(new Date(), "yyyy-MM-dd")
  const maxDate = format(addDays(new Date(), 30), "yyyy-MM-dd")

  const getWorkingHoursForDay = (date: string) => {
    const dayOfWeek = format(new Date(date), 'EEEE').toLowerCase()
    return workingHours[dayOfWeek]
  }

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
          onChange={(e) => onTimeChange(e.target.value)}
          required
          disabled={!date}
          className="input-primary"
        />
      </div>
    </div>
  )
}