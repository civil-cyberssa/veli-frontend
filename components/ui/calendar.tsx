"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-1",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-transparent p-0 hover:bg-accent rounded-md transition-colors",
          "inline-flex items-center justify-center",
          "disabled:opacity-30 disabled:pointer-events-none"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex mb-1",
        head_cell: "text-muted-foreground rounded-md w-10 font-normal text-xs uppercase tracking-wider",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "h-10 w-10",
          "[&:has([aria-selected])]:bg-transparent"
        ),
        day: cn(
          "h-10 w-10 p-0 font-normal rounded-full",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "inline-flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-primary text-primary-foreground font-medium",
          "hover:bg-primary/90 hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground"
        ),
        day_today: cn(
          "bg-accent text-accent-foreground font-semibold",
          "border border-primary/40"
        ),
        day_outside: cn(
          "text-muted-foreground/40",
          "aria-selected:bg-accent/50 aria-selected:text-muted-foreground"
        ),
        day_disabled: "text-muted-foreground/30 pointer-events-none",
        day_range_middle: cn(
          "aria-selected:bg-accent aria-selected:text-accent-foreground"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
