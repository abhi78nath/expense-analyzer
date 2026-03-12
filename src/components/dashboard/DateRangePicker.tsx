import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import { setDateRange } from "@/shared/redux/features";

interface DateRangePickerProps {
    className?: string;
}

export function DateRangePicker({ className }: DateRangePickerProps) {
    const dateRange = useSelector((state: RootState) => state.dateRange.dateRange);
    const [selectedDate, setSelectedDate] = useState<DateRange | undefined>(dateRange);
    const [open, setOpen] = useState(false);

    const dispatch = useDispatch();

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            setSelectedDate(dateRange);
        }
    }


    const label =
        dateRange?.from && dateRange?.to
            ? `${format(dateRange.from, "MMM d, yyyy")} – ${format(dateRange.to, "MMM d, yyyy")}`
            : dateRange?.from
                ? format(dateRange.from, "MMM d, yyyy")
                : "Pick a date range";

    const handleApplyDateRange = () => {
        dispatch(setDateRange(selectedDate));
        setOpen(false);
    }

    console.log(dateRange, 'dateRange')
    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-8 gap-2 rounded-lg border-slate-700 bg-slate-800/60 px-3 text-xs font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-700/80 hover:text-white cursor-pointer",
                        dateRange && "border-emerald-500/40 text-emerald-400 hover:border-emerald-500/60 hover:text-emerald-300",
                        className
                    )}
                >
                    <CalendarIcon className="size-3.5 shrink-0" />
                    <span className="max-w-[200px] truncate">{label}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-auto border-slate-700 bg-slate-900 p-0 shadow-xl shadow-black/40"
            >
                {/* Calendar */}
                <Calendar
                    mode="range"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    numberOfMonths={2}
                    className="p-3 [--cell-size:2rem] text-slate-200"
                    classNames={{
                        months: "relative flex flex-col sm:flex-row gap-4",
                        month_caption: "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size] text-slate-200",
                        day: "group/day relative aspect-square h-full w-full select-none p-0 text-center text-slate-300 [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
                        today: "bg-slate-700/60 text-slate-100 rounded-md data-[selected=true]:rounded-none",
                        outside: "text-slate-600 aria-selected:text-slate-500",
                        disabled: "text-slate-700 opacity-50",
                        weekday: "text-slate-500 flex-1 select-none rounded-md text-[0.8rem] font-normal",
                        range_start: "bg-emerald-500/20 rounded-l-md",
                        range_middle: "bg-emerald-500/10 rounded-none",
                        range_end: "bg-emerald-500/20 rounded-r-md",
                    }}
                />

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-700/60 px-4 py-3">
                    {dateRange && (
                        <Button
                            onClick={() => {
                                dispatch(setDateRange(undefined));
                                setSelectedDate(undefined);
                            }}
                            className="h-7 px-3 text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                            Clear
                        </Button>
                    )}
                    <div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-3 text-xs text-slate-400 hover:text-white cursor-pointer"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="h-7 bg-emerald-500/20 px-3 text-xs text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 border border-emerald-500/30 cursor-pointer"
                            onClick={() => { handleApplyDateRange() }}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
