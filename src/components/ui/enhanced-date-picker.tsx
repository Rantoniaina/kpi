import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface EnhancedDatePickerProps {
  value?: string; // YYYY-MM-DD format
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: string; // YYYY-MM-DD format
  max?: string; // YYYY-MM-DD format
}

export function EnhancedDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
  min,
  max,
}: EnhancedDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"date" | "month" | "year">("date");
  const [displayMonth, setDisplayMonth] = useState(() => {
    if (value) {
      const date = new Date(value + "T00:00:00");
      return { month: date.getMonth(), year: date.getFullYear() };
    }
    return { month: new Date().getMonth(), year: new Date().getFullYear() };
  });

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = min ? new Date(min + "T00:00:00") : null;
  const maxDate = max ? new Date(max + "T00:00:00") : null;

  // Update display month when value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value + "T00:00:00");
      setDisplayMonth({ month: date.getMonth(), year: date.getFullYear() });
    }
  }, [value]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    const dateStr = formatDate(date);
    onChange?.(dateStr);
    setOpen(false);
  };

  const handleMonthSelect = (month: number) => {
    setDisplayMonth({ ...displayMonth, month });
    setView("date");
  };

  const handleYearSelect = (year: number) => {
    setDisplayMonth({ ...displayMonth, year });
    setView("month");
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setDisplayMonth((prev) => {
      if (direction === "prev") {
        if (prev.month === 0) {
          return { month: 11, year: prev.year - 1 };
        }
        return { month: prev.month - 1, year: prev.year };
      } else {
        if (prev.month === 11) {
          return { month: 0, year: prev.year + 1 };
        }
        return { month: prev.month + 1, year: prev.year };
      }
    });
  };

  const navigateYear = (direction: "prev" | "next") => {
    setDisplayMonth((prev) => ({
      ...prev,
      year: direction === "prev" ? prev.year - 1 : prev.year + 1,
    }));
  };

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderDateView = () => {
    const daysInMonth = getDaysInMonth(displayMonth.month, displayMonth.year);
    const firstDay = getFirstDayOfMonth(displayMonth.month, displayMonth.year);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(displayMonth.year, displayMonth.month, day, 0, 0, 0)
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setView("month")}
              className="h-7 px-3 text-sm font-medium"
            >
              {monthNames[displayMonth.month]}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setView("year")}
              className="h-7 px-3 text-sm font-medium"
            >
              {displayMonth.year}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground p-1"
            >
              {day}
            </div>
          ))}
          {days.map((date, idx) => {
            if (!date) {
              return <div key={idx} className="p-1" />;
            }

            const dateStr = formatDate(date);
            const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
            const isToday = formatDate(today) === dateStr;
            const isDisabled = isDateDisabled(date);

            return (
              <Button
                key={idx}
                type="button"
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  isSelected && "bg-primary text-primary-foreground",
                  isToday && !isSelected && "bg-muted font-semibold",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => handleDateSelect(date)}
                disabled={isDisabled}
              >
                {date.getDate()}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigateYear("prev")}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setView("year")}
            className="h-7 px-3 text-sm font-medium"
          >
            {displayMonth.year}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigateYear("next")}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {monthNames.map((month, idx) => (
            <Button
              key={month}
              type="button"
              variant={displayMonth.month === idx ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-9 text-xs",
                displayMonth.month === idx && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleMonthSelect(idx)}
            >
              {month.slice(0, 3)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const startYear = Math.floor(displayMonth.year / 10) * 10;
    const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDisplayMonth({ ...displayMonth, year: startYear - 12 })}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {startYear - 1} - {startYear + 10}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDisplayMonth({ ...displayMonth, year: startYear + 12 })}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {years.map((year) => (
            <Button
              key={year}
              type="button"
              variant={displayMonth.year === year ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-9 text-xs",
                displayMonth.year === year && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
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
          {value ? (
            new Date(value + "T00:00:00").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        {view === "date" && renderDateView()}
        {view === "month" && renderMonthView()}
        {view === "year" && renderYearView()}
      </PopoverContent>
    </Popover>
  );
}

// Controlled version for react-hook-form
interface EnhancedDateFieldProps extends EnhancedDatePickerProps {
  error?: string;
  label?: string;
  description?: string;
}

export function EnhancedDateField({
  label,
  description,
  error,
  ...props
}: EnhancedDateFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
        </label>
      )}
      <EnhancedDatePicker {...props} />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

