"use client";
import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EnhancedCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  formatDate?: (date: Date) => string;
}

export function EnhancedCalendar({
  selected,
  onSelect,
  placeholder = "Selecionar data",
  label,
  className,
  buttonClassName,
  disabled = false,
  formatDate = (date: Date) => date.toLocaleDateString(),
}: EnhancedCalendarProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onSelect?.(date);
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <Label htmlFor="date" className="px-1 text-sm font-medium">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            disabled={disabled}
            className={cn(
              "w-[180px] justify-between font-normal",
              !selected && "text-muted-foreground",
              buttonClassName
            )}
          >
            {selected ? formatDate(selected) : placeholder}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            captionLayout="dropdown"
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
