import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { TransactionRow } from "@/utils/textParser";

interface CreditsDebitsChartProps {
    transactions: TransactionRow[];
}

interface DailyData {
    label: string;
    fullDate: string;
    credits: number;
    debits: number;
}

const formatINR = (v: number) =>
    "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const parseDate = (dateStr: string): Date | null => {
    // Supports DD-MM-YYYY, DD/MM/YYYY, DD-MM-YY, DD/MM/YY
    const parts = dateStr.split(/[-\/]/);
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 text-xs font-bold text-white">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-8 text-[11px]">
                        <span className="text-teal-400">Credits:</span>
                        <span className="font-mono text-white">{formatINR(payload[0].value)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-8 text-[11px]">
                        <span className="text-rose-400">Debits:</span>
                        <span className="font-mono text-white">{formatINR(payload[1].value)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const CreditsDebitsChart = ({ transactions }: CreditsDebitsChartProps) => {
    const dailyData: DailyData[] = useMemo(() => {
        const map = new Map<string, { credits: number; debits: number; dateObj: Date }>();

        transactions.forEach((t) => {
            const date = parseDate(t.date);
            if (!date) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const existing = map.get(key) || { credits: 0, debits: 0, dateObj: date };
            existing.credits += t.credit ?? 0;
            existing.debits += t.debit ?? 0;
            map.set(key, existing);
        });

        // Sort by key and take last 15 days to avoid overcrowding
        const sorted = [...map.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-15);

        return sorted.map(([key, data]) => {
            const d = data.dateObj;
            return {
                label: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
                fullDate: key,
                credits: data.credits,
                debits: data.debits,
            };
        });
    }, [transactions]);

    if (dailyData.length === 0) {
        return (
            <div
                className="rounded-2xl border border-slate-700/60 p-6 mb-6"
                style={{
                    background: "rgba(30, 41, 59, 0.50)",
                    backdropFilter: "blur(16px)",
                }}
            >
                <h2 className="text-lg font-semibold text-white">Credits vs Debits</h2>
                <p className="mt-2 text-sm text-slate-500">Not enough data to display chart.</p>
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl border border-slate-700/60 p-6 mb-6"
            style={{
                background: "rgba(30, 41, 59, 0.50)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
            }}
        >
            {/* Header */}
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Credits vs Debits</h2>
                    <p className="text-xs text-slate-500">Daily comparison over the last 15 transaction days</p>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                        <span className="text-xs text-slate-400">Credits</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <span className="text-xs text-slate-400">Debits</span>
                    </div>
                </div>
            </div>

            {/* Recharts BarChart */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dailyData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        barGap={8}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#1e293b"
                        />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 10 }}
                            tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
                        <Bar
                            dataKey="credits"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={30}
                        >
                            {dailyData.map((_, index) => (
                                <Cell key={`cell-credit-${index}`} fill="url(#colorCredits)" />
                            ))}
                        </Bar>
                        <Bar
                            dataKey="debits"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={30}
                        >
                            {dailyData.map((_, index) => (
                                <Cell key={`cell-debit-${index}`} fill="url(#colorDebits)" />
                            ))}
                        </Bar>
                        <defs>
                            <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorDebits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CreditsDebitsChart;
