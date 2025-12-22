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
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-5",
        caption: "flex justify-center pt-1 relative items-center mb-1",
        caption_label: "text-sm font-semibold tracking-tight",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-transparent p-0 hover:bg-accent/60 rounded-lg transition-all duration-200",
          "border border-transparent hover:border-border/40",
          "flex items-center justify-center",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse space-y-1.5",
        head_row: "flex gap-1",
        head_cell:
          "text-muted-foreground/70 rounded-md w-10 font-medium text-[0.7rem] uppercase tracking-wider",
        row: "flex w-full gap-1 mt-1.5",
        cell: cn(
          "relative h-10 w-10 text-center text-sm p-0 rounded-lg",
          "focus-within:relative focus-within:z-20",
          // Range styling
          "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
          "[&:has([aria-selected].day-range-start)]:rounded-l-lg",
          "[&:has([aria-selected].day-outside)]:bg-accent/30",
          "[&:has([aria-selected])]:bg-accent/20"
        ),
        day: cn(
          "h-10 w-10 p-0 font-normal rounded-lg transition-all duration-200",
          "hover:bg-accent/60 hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0",
          "aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end rounded-r-lg",
        day_range_start: "day-range-start rounded-l-lg",
        day_selected: cn(
          "bg-primary text-primary-foreground font-semibold",
          "hover:bg-primary hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground",
          "shadow-sm hover:shadow-md"
        ),
        day_today: cn(
          "bg-accent/40 text-accent-foreground font-semibold",
          "border border-primary/30",
          "hover:bg-accent/60"
        ),
        day_outside: cn(
          "day-outside text-muted-foreground/40",
          "aria-selected:bg-accent/30 aria-selected:text-muted-foreground/50"
        ),
        day_disabled: "text-muted-foreground/30 hover:bg-transparent hover:scale-100 cursor-not-allowed",
        day_range_middle: cn(
          "aria-selected:bg-accent/30 aria-selected:text-accent-foreground",
          "rounded-none"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-muted-foreground" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-muted-foreground" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
