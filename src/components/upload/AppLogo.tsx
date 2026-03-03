import { BarChart3 } from "lucide-react";

const AppLogo = () => {
    return (
        <div className="flex flex-col items-center gap-3 mb-8">
            {/* Circular logo icon */}
            <div
                className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg shadow-emerald-500/20"
                style={{
                    background: "linear-gradient(135deg, #10b981, #14b8a6)",
                }}
            >
                <BarChart3 className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>

            {/* App name — gradient text */}
            <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent"
                style={{
                    backgroundImage: "linear-gradient(135deg, #10b981, #14b8a6, #22d3ee)",
                }}
            >
                Expense Analyzer
            </h1>

            {/* Tagline */}
            <p className="text-sm sm:text-base text-[#94a3b8]">
                Upload your bank statement to get started
            </p>
        </div>
    );
};

export default AppLogo;
