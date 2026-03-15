import { useMemo, useState } from "react";
import {
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    Sector,
    type PieSectorShapeProps,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Layers } from "lucide-react";
import type { TransactionRow } from "@/utils/textParser";
import { tagColors } from "@/lib/tagColors";
import { capitalize } from "@/utils/colorUtils";
import { Button } from "@/components/ui/button";
import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface TagDistributionChartProps {
    transactions: TransactionRow[];
}

const formatINR = (v: number) =>
    "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isInner = payload[0].name.includes("(Credit)");
        return (
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    {isInner ? "Credit" : "Debit"}
                </p>
                <p className="mb-1 text-xs font-bold text-white">{capitalize(data.displayName || data.name)}</p>
                <p className="text-[11px] font-mono text-teal-400">{formatINR(data.value)}</p>
                <p className="text-[10px] text-slate-500">{data.percent.toFixed(1)}% of category</p>
            </div>
        );
    }
    return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, displayName }: any) => {
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#94a3b8"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-[10px] font-medium text-wrap"
        >
            {`${capitalize(displayName || name)} (${(percent * 100).toFixed(0)}%)`}
        </text>
    );
};

const TagDistributionChart = ({ transactions }: TagDistributionChartProps) => {
    const [mode, setMode] = useState<"Debit" | "Credit" | "Comparison">("Debit");

    const { debitData, creditData } = useMemo(() => {
        const debitTagMap = new Map<string, number>();
        const creditTagMap = new Map<string, number>();
        let totalDebit = 0;
        let totalCredit = 0;

        transactions.forEach((t) => {
            const debit = t.debit ?? 0;
            const credit = t.credit ?? 0;
            const tag = (t.tag || "other").toLowerCase();

            if (debit > 0) {
                debitTagMap.set(tag, (debitTagMap.get(tag) || 0) + debit);
                totalDebit += debit;
            }
            if (credit > 0) {
                creditTagMap.set(tag, (creditTagMap.get(tag) || 0) + credit);
                totalCredit += credit;
            }
        });

        const processMap = (map: Map<string, number>, total: number, suffix = "") => {
            if (total === 0) return [];
            return Array.from(map.entries())
                .map(([name, value]) => ({
                    name: `${name}${suffix}`,
                    displayName: name,
                    value,
                    percent: (value / total),
                }))
                .sort((a, b) => b.value - a.value);
        };

        return {
            debitData: processMap(debitTagMap, totalDebit),
            creditData: processMap(creditTagMap, totalCredit, " (Credit)"),
        };
    }, [transactions]);

    const activeData = mode === "Debit" ? debitData : mode === "Credit" ? creditData : [];
    const hasData = mode === "Comparison" ? (debitData.length > 0 || creditData.length > 0) : activeData.length > 0;

    const title = mode === "Debit" ? "Debit by Tag" : mode === "Credit" ? "Credit by Tag" : "Comparison by Tag";
    const description = mode === "Debit"
        ? "Distribution of debits across categories"
        : mode === "Credit"
            ? "Distribution of credits across categories"
            : "Inner: Credit | Outer: Debit";

    const ToggleButtons = () => (
        <TooltipProvider delayDuration={200}>
            <div className="flex h-9 items-center rounded-xl border border-slate-700 bg-slate-900/50 p-1">
                <UITooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setMode("Debit")}
                            className={`flex h-full items-center gap-2 rounded-lg px-2.5 text-[10px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${mode === "Debit"
                                ? "bg-slate-700 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <ArrowDownRight className="h-3.5 w-3.5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs px-2 py-1">
                        <p>Debit by Tag</p>
                    </TooltipContent>
                </UITooltip>

                <UITooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setMode("Credit")}
                            className={`flex h-full items-center gap-2 rounded-lg px-2.5 text-[10px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${mode === "Credit"
                                ? "bg-slate-700 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs px-2 py-1">
                        <p>Credit by Tag</p>
                    </TooltipContent>
                </UITooltip>

                <UITooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setMode("Comparison")}
                            className={`flex h-full items-center gap-2 rounded-lg px-2.5 text-[10px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${mode === "Comparison"
                                ? "bg-slate-700 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <Layers className="h-3.5 w-3.5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs px-2 py-1">
                        <p>Comparison by Tag</p>
                    </TooltipContent>
                </UITooltip>
            </div>
        </TooltipProvider>
    );

    if (!hasData) {
        return (
            <div
                className="rounded-2xl border border-slate-700/60 p-6 h-full flex flex-col relative"
                style={{
                    background: "rgba(30, 41, 59, 0.50)",
                    backdropFilter: "blur(16px)",
                }}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
                        <p className="text-xs text-slate-500">{description}</p>
                    </div>
                    <ToggleButtons />
                </div>
                <div className="flex-1 flex flex-col justify-center items-center">
                    <p className="text-sm text-slate-500">No {mode === "Comparison" ? "data" : mode.toLowerCase() + " data"} available.</p>
                </div>
            </div>
        );
    }

    const MyCustomPie = (props: PieSectorShapeProps) => {
        const { payload } = props;
        const tag = (payload.displayName || payload.name.replace(" (Credit)", "")).toLowerCase();
        const color = tagColors[tag] || tagColors["other"];
        return <Sector {...props} fill={color} stroke="none" />;
    };

    return (
        <div
            className="rounded-2xl border border-slate-700/60 p-6 h-full flex flex-col"
            style={{
                background: "rgba(30, 41, 59, 0.50)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
            }}
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
                <ToggleButtons />
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        {mode === "Comparison" ? (
                            <>
                                <Pie
                                    data={creditData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={65}
                                    dataKey="value"
                                    shape={MyCustomPie}
                                    stroke="none"
                                    startAngle={90}
                                    endAngle={450}
                                />
                                <Pie
                                    data={debitData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={105}
                                    dataKey="value"
                                    paddingAngle={3}
                                    label={renderCustomizedLabel}
                                    labelLine={{ stroke: '#334155', strokeWidth: 1 }}
                                    shape={MyCustomPie}
                                    stroke="none"
                                    startAngle={90}
                                    endAngle={450}
                                />
                            </>
                        ) : (
                            <Pie
                                data={activeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                                label={renderCustomizedLabel}
                                labelLine={{ stroke: '#334155', strokeWidth: 1 }}
                                shape={MyCustomPie}
                                stroke="none"
                                startAngle={90}
                                endAngle={450}
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TagDistributionChart;
