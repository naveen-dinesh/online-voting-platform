
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DropdownProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // For year/month dropdowns
import { ScrollArea } from "@/components/ui/scroll-area" // For year dropdown scroll


export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown-buttons", // Enable dropdowns for month/year
  fromYear = new Date().getFullYear() - 100, // Example: 100 years back
  toYear = new Date().getFullYear() + 10,   // Example: 10 years forward
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: captionLayout === "dropdown-buttons" ? "hidden" : "text-sm font-medium", // Hide default label if dropdowns are used
        caption_dropdowns: "flex gap-2", // Style for dropdown container
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30", // Adjusted opacity for selected outside days
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" {...props} />,
        Dropdown: ({ value, onChange, name, caption, children }: DropdownProps) => {
          const options = React.Children.toArray(children) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
          const selected = options.find((child) => child.props.value === value);
          const handleChange = (newValue: string) => {
            const e = { target: { value: newValue } } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(e);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(newValue) => {
                handleChange(newValue)
              }}
            >
              <SelectTrigger className="h-7 text-xs px-2 w-[calc(var(--rdp-caption-width,0px)_+_1rem)] data-[ συγκεκριμένα=month]:grow-0 data-[ συγκεκριμένα=year]:grow">
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-48">
                <ScrollArea className={name === 'years' ? "h-40" : ""}>
                {options.map((option, id: number) => (
                  <SelectItem
                    key={`${id}-${option.props.value}`}
                    value={option.props.value?.toString() ?? ""}
                  >
                    {option.props.children}
                  </SelectItem>
                ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
      }}
      captionLayout={captionLayout}
      fromYear={fromYear}
      toYear={toYear}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
