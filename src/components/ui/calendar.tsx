import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  month?: Date;
  selected?: Date | Date[];
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  mode?: "single" | "multiple" | "range";
}

function Calendar({
  className,
  month = new Date(),
  selected,
  onSelect,
  disabled,
  mode = "single",
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(month);
  const [selectedDates, setSelectedDates] = React.useState<Date[]>(
    Array.isArray(selected) ? selected : selected ? [selected] : []
  );

  // Update internal state when selected prop changes
  React.useEffect(() => {
    if (selected) {
      setSelectedDates(Array.isArray(selected) ? selected : [selected]);
    }
  }, [selected]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Check if a date is selected
  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => 
      selectedDate && 
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    );
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (disabled && disabled(date)) return;
    
    let newSelectedDates: Date[] = [];
    
    if (mode === "single") {
      newSelectedDates = [date];
    } else if (mode === "multiple") {
      newSelectedDates = isDateSelected(date)
        ? selectedDates.filter(d => 
            !(d.getDate() === date.getDate() && 
              d.getMonth() === date.getMonth() && 
              d.getFullYear() === date.getFullYear())
          )
        : [...selectedDates, date];
    } else if (mode === "range") {
      // Simple range implementation
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        newSelectedDates = [date];
      } else {
        newSelectedDates = [...selectedDates, date].sort((a, b) => a.getTime() - b.getTime());
      }
    }
    
    setSelectedDates(newSelectedDates);
    
    if (onSelect) {
      onSelect(mode === "single" ? date : newSelectedDates[0]);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  // Days of the week
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calendar days
  const calendarDays = generateCalendarDays();

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </button>
        
        <h2 className="text-sm font-medium">
          {getMonthName(currentMonth)} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <div key={index} className="text-center p-0">
            {day ? (
              <button
                onClick={() => handleDateSelect(day)}
                disabled={disabled ? disabled(day) : false}
                className={cn(
                  "h-8 w-8 p-0 font-normal rounded-md",
                  isDateSelected(day) && "bg-primary text-primary-foreground",
                  isToday(day) && !isDateSelected(day) && "bg-accent text-accent-foreground",
                  !isToday(day) && !isDateSelected(day) && "hover:bg-accent hover:text-accent-foreground",
                  disabled && disabled(day) && "opacity-50 cursor-not-allowed"
                )}
              >
                {day.getDate()}
              </button>
            ) : (
              <div className="h-8 w-8"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar }; 