import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { Clock, Calendar } from "lucide-react";

interface DateTimePickerProps {
  value?: string; // ISO format: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: string; // ISO format
  max?: string; // ISO format
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled,
  className,
  min,
  max,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  
  // Parse value into date and time components
  const parseValue = (val?: string): { date: string; time: string } => {
    if (!val) {
      const now = new Date();
      return {
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5), // HH:mm format
      };
    }
    
    // Handle both YYYY-MM-DDTHH:mm and YYYY-MM-DDTHH:mm:ss formats
    const [datePart, timePart] = val.split("T");
    const time = timePart ? timePart.slice(0, 5) : "00:00";
    
    return {
      date: datePart || new Date().toISOString().split("T")[0],
      time: time,
    };
  };

  const { date: currentDate, time: currentTime } = parseValue(value);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedTime, setSelectedTime] = useState(currentTime);

  // Update local state when value prop changes
  useEffect(() => {
    const parsed = parseValue(value);
    setSelectedDate(parsed.date);
    setSelectedTime(parsed.time);
  }, [value]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    updateValue(newDate, selectedTime);
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    updateValue(selectedDate, newTime);
  };

  const updateValue = (date: string, time: string) => {
    const datetime = `${date}T${time}:00`;
    onChange?.(datetime);
  };

  const formatDisplayValue = (): string => {
    if (!value) return placeholder;
    
    try {
      const dt = new Date(value);
      return dt.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return placeholder;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <EnhancedDatePicker
              value={selectedDate}
              onChange={handleDateChange}
              min={min ? min.split("T")[0] : undefined}
              max={max ? max.split("T")[0] : undefined}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Time</label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                updateValue(selectedDate, selectedTime);
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Controlled version for react-hook-form
interface DateTimeFieldProps extends DateTimePickerProps {
  error?: string;
  label?: string;
  description?: string;
}

export function DateTimeField({
  label,
  description,
  error,
  ...props
}: DateTimeFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
        </label>
      )}
      <DateTimePicker {...props} />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

