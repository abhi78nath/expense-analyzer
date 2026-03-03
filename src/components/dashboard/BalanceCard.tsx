import type { LucideIcon } from "lucide-react";

interface BalanceCardProps {
    icon: LucideIcon;
    label: string;
    amount: string;
    subtitle: string;
    accentColor: "emerald" | "teal" | "rose";
    changeText?: string;
    changePositive?: boolean;
}

const accentMap = {
    emerald: {
        border: "border-l-emerald-500",
        iconBg: "bg-emerald-500/15",
        iconColor: "text-emerald-400",
        glow: "hover:shadow-emerald-500/8",
    },
    teal: {
        border: "border-l-teal-500",
        iconBg: "bg-teal-500/15",
        iconColor: "text-teal-400",
        glow: "hover:shadow-teal-500/8",
    },
    rose: {
        border: "border-l-rose-500",
        iconBg: "bg-rose-500/15",
        iconColor: "text-rose-400",
        glow: "hover:shadow-rose-500/8",
    },
};

const BalanceCard = ({
    icon: Icon,
    label,
    amount,
    subtitle,
    accentColor,
    changeText,
    changePositive,
}: BalanceCardProps) => {
    const accent = accentMap[accentColor];

    return (
        <div
            className={`
        group relative overflow-hidden rounded-2xl border border-slate-700/60 border-l-[3px]
        ${accent.border} p-5 transition-all duration-300
        hover:shadow-lg ${accent.glow}
      `}
            style={{
                background: "rgba(30, 41, 59, 0.50)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
            }}
        >
            {/* Icon circle — top right */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-400">{label}</p>
                    <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {amount}
                    </p>
                </div>
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.iconBg}`}
                >
                    <Icon className={`h-5 w-5 ${accent.iconColor}`} />
                </div>
            </div>

            {/* Subtitle / change indicator */}
            <div className="mt-3">
                {changeText ? (
                    <span
                        className={`text-xs font-medium ${changePositive ? "text-emerald-400" : "text-rose-400"
                            }`}
                    >
                        {changeText}
                    </span>
                ) : (
                    <span className="text-xs text-slate-500">{subtitle}</span>
                )}
            </div>

            {/* Subtle accent gradient overlay on hover */}
            <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`}
                style={{
                    background: `radial-gradient(ellipse at top right, ${accentColor === "emerald"
                        ? "rgba(16,185,129,0.04)"
                        : accentColor === "teal"
                            ? "rgba(20,184,166,0.04)"
                            : "rgba(244,63,94,0.04)"
                        } 0%, transparent 70%)`,
                }}
            />
        </div>
    );
};

export default BalanceCard;
