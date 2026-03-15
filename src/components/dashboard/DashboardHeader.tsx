import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";
import UploadModal from "../upload/UploadModal";

interface DashboardHeaderProps {
    onBackToUpload?: () => void;
    onAnalyze: (files: File[], password?: string, isAppend?: boolean) => Promise<boolean>;
    isParsing: boolean;
    errorMessage?: string;
    uploadedFiles: File[];
}

const DashboardHeader = ({ onBackToUpload, onAnalyze, isParsing, errorMessage, uploadedFiles }: DashboardHeaderProps) => {
    // const [activePeriod, setActivePeriod] = useState<string>("This Month");

    return (
        <div className="sticky top-0 z-40 -mx-4 -mt-6 mb-6 flex flex-col gap-4 border-b border-slate-800/40 bg-slate-900/80 px-4 py-4 pt-6 backdrop-blur-xl sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        {onBackToUpload && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onBackToUpload}
                                className="h-8 rounded-lg border-slate-700 bg-slate-800/60 px-3 text-xs text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                            >
                                ← New Upload
                            </Button>
                        )}
                        <UploadModal
                            onAnalyze={onAnalyze}
                            isLoading={isParsing}
                            errorMessage={errorMessage}
                            existingFiles={uploadedFiles}
                        />
                    </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                    Your financial overview at a glance
                </p>
            </div>

            <div className="flex flex-wrap gap-2 self-baseline">
                {/* {periods.map((period) => (
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
                ))} */}
                <div className="flex items-center gap-2">
                    {/* Divider */}
                    {/* <span className="h-4 w-px bg-slate-700" /> */}

                    <DateRangePicker />
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
