import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        if (onCheckedChange) {
          onCheckedChange(!checked);
        }
      }
    };

    return (
      <div
        ref={ref}
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-green-500" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch }; 