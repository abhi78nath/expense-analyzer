import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyzeButtonProps {
    disabled: boolean;
    isLoading: boolean;
    onClick?: () => void;
}

const AnalyzeButton = ({ disabled, isLoading, onClick }: AnalyzeButtonProps) => {
    return (
        <Button
            type="submit"
            id="analyze-button"
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
        w-full h-12 rounded-xl text-sm font-bold tracking-wide
        transition-all duration-300 ease-out
        ${disabled || isLoading
                    ? "cursor-not-allowed bg-slate-800 text-slate-500"
                    : "cursor-pointer text-emerald-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110 active:scale-[0.98]"
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
        </Button>
    );
};

export default AnalyzeButton;
