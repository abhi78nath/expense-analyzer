import { useState } from "react";
import { Button } from "@/components/ui/button";

const periods = ["This Week", "This Month", "Last Month", "Custom"] as const;

interface DashboardHeaderProps {
    onBackToUpload?: () => void;
}

const DashboardHeader = ({ onBackToUpload }: DashboardHeaderProps) => {
    const [activePeriod, setActivePeriod] = useState<string>("This Month");

    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Dashboard
                    </h1>
                    {onBackToUpload && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onBackToUpload}
                            className="h-7 rounded-lg border-slate-700 bg-slate-800/60 px-3 text-xs text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                        >
                            ← New Upload
                        </Button>
                    )}
                </div>
                <p className="mt-1 text-sm text-slate-400">
                    Your financial overview at a glance
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {periods.map((period) => (
                    <Button
                        key={period}
                        variant="ghost"
                        size="sm"
                        onClick={() => setActivePeriod(period)}
                        className={`
              h-8 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
              ${activePeriod === period
                                ? "bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10 hover:bg-emerald-500/30 hover:text-emerald-400"
                                : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                            }
            `}
                    >
                        {period}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default DashboardHeader;
