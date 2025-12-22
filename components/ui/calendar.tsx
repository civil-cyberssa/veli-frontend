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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center px-1 mb-2",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent rounded-md transition-all",
          "inline-flex items-center justify-center"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground w-full font-normal text-xs flex-1 text-center pb-2",
        row: "flex w-full mt-0.5",
        cell: cn(
          "relative p-0 text-center flex-1 focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-transparent"
        ),
        day: cn(
          "h-9 w-full p-0 font-normal aria-selected:opacity-100 rounded-full",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "inline-flex items-center justify-center"
        ),
        day_selected: cn(
          "bg-primary text-primary-foreground",
          "hover:bg-primary hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground"
        ),
        day_today: cn(
          "bg-accent text-accent-foreground font-semibold"
        ),
        day_outside: cn(
          "text-muted-foreground opacity-50",
          "aria-selected:bg-accent/50 aria-selected:text-muted-foreground"
        ),
        day_disabled: "text-muted-foreground opacity-30 hover:bg-transparent cursor-not-allowed",
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
