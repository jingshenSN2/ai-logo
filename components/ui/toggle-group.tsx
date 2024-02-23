import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const ToggleGroup = ({
  className,
  options,
  value,
  onChange,
  disabled,
}: ToggleGroupProps) => {
  return (
    <div
      className={cn(
        "flex rounded-md border border-input bg-background m-2",
        className
      )}
    >
      {options.map((option) => (
        <div
          key={option}
          className={cn(
            "flex items-center justify-center h-10 px-3 text-sm file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-50 whitespace-nowrap",
            value === option
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            options.indexOf(option) === 0 ? "rounded-l-md" : "",
            options.indexOf(option) === options.length - 1 ? "rounded-r-md" : ""
          )}
          onClick={() => !disabled && onChange(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};

ToggleGroup.displayName = "ToggleGroup";

export { ToggleGroup };
