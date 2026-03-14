import { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import { LayoutGrid, TrendingUp } from "lucide-react";
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
    const [chartType, setChartType] = useState<"bar" | "line">("line");

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

        // Sort by key
        const sorted = [...map.entries()]
            .sort(([a], [b]) => a.localeCompare(b));

        // Determine if data spans multiple years
        const years = new Set(sorted.map(([key]) => key.split("-")[0]));
        const isMultiYear = years.size > 1;

        return sorted.map(([key, data]) => {
            const d = data.dateObj;
            const label = isMultiYear
                ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
                : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;

            return {
                label,
                fullDate: key,
                credits: data.credits,
                debits: data.debits,
            };
        });
    }, [transactions]);

    if (dailyData.length === 0) {
        return (
            <div
                className="rounded-2xl border border-slate-700/60 p-6"
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

    console.log(dailyData, 'dailyData')
    return (
        <div
            className="rounded-2xl border border-slate-700/60 p-6"
            style={{
                background: "rgba(30, 41, 59, 0.50)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
            }}
        >
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Credits vs Debits</h2>
                    <p className="text-xs text-slate-500">Daily comparison of credits and debits</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Legend */}
                    <div className="hidden items-center gap-4 lg:flex">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                            <span className="text-xs text-slate-400">Credits</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                            <span className="text-xs text-slate-400">Debits</span>
                        </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex h-9 items-center rounded-xl border border-slate-700 bg-slate-900/50 p-1">
                        <button
                            onClick={() => setChartType("line")}
                            className={`flex h-full items-center gap-2 rounded-lg px-3 text-xs font-medium transition-all duration-200 cursor-pointer ${chartType === "line"
                                ? "bg-slate-700 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <TrendingUp className="h-3.5 w-3.5" />
                            Line
                        </button>
                        <button
                            onClick={() => setChartType("bar")}
                            className={`flex h-full items-center gap-2 rounded-lg px-3 text-xs font-medium transition-all duration-200 cursor-pointer ${chartType === "bar"
                                ? "bg-slate-700 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Bar
                        </button>
                    </div>
                </div>
            </div>

            {/* Recharts Chart */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "bar" ? (
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
                    ) : (
                        <AreaChart
                            data={dailyData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                            <Tooltip content={<CustomTooltip />} />
                            <defs>
                                <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDebits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="credits"
                                stroke="#14b8a6"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorCredits)"
                            />
                            <Area
                                type="monotone"
                                dataKey="debits"
                                stroke="#f43f5e"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorDebits)"
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CreditsDebitsChart;
