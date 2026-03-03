import { Loader2 } from "lucide-react";

interface AnalyzeButtonProps {
    disabled: boolean;
    isLoading: boolean;
    onClick: () => void;
}

const AnalyzeButton = ({ disabled, isLoading, onClick }: AnalyzeButtonProps) => {
    return (
        <button
            id="analyze-button"
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
        w-full rounded-xl py-3.5 text-sm font-bold tracking-wide
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-[#0f172a]
        ${disabled || isLoading
                    ? "cursor-not-allowed bg-[#1e293b] text-[#475569]"
                    : "cursor-pointer text-[#022c22] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110 active:scale-[0.98]"
                }
      `}
            style={
                !(disabled || isLoading)
                    ? { background: "linear-gradient(135deg, #10b981, #14b8a6)" }
                    : undefined
            }
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                </span>
            ) : (
                "Analyze Statement"
            )}
        </button>
    );
};

export default AnalyzeButton;
