import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    Sector,
    type PieSectorShapeProps,
} from "recharts";
import type { TransactionRow } from "@/utils/textParser";
import { tagColors } from "@/lib/tagColors";
import { capitalize } from "@/utils/colorUtils";

interface TagDistributionChartProps {
    transactions: TransactionRow[];
}

const formatINR = (v: number) =>
    "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-1 text-xs font-bold text-white">{capitalize(data.name)}</p>
                <p className="text-[11px] font-mono text-teal-400">{formatINR(data.value)}</p>
                <p className="text-[10px] text-slate-500">{data.percent.toFixed(1)}% of total</p>
            </div>
        );
    }
    return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
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
            {`${capitalize(name)} (${(percent * 100).toFixed(0)}%)`}
        </text>
    );
};

const TagDistributionChart = ({ transactions }: TagDistributionChartProps) => {
    const data = useMemo(() => {
        const tagMap = new Map<string, number>();
        let totalDebit = 0;

        transactions.forEach((t) => {
            const debit = t.debit ?? 0;
            if (debit > 0) {
                const tag = (t.tag || "other").toLowerCase();
                tagMap.set(tag, (tagMap.get(tag) || 0) + debit);
                totalDebit += debit;
            }
        });

        return Array.from(tagMap.entries())
            .map(([name, value]) => ({
                name,
                value,
                percent: (value / totalDebit),
            }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    if (data.length === 0) {
        return (
            <div
                className="rounded-2xl border border-slate-700/60 p-6 h-full flex flex-col justify-center items-center"
                style={{
                    background: "rgba(30, 41, 59, 0.50)",
                    backdropFilter: "blur(16px)",
                }}
            >
                <h2 className="text-lg font-semibold text-white mb-2">Spending</h2>
                <p className="text-sm text-slate-500">No debit data available.</p>
            </div>
        );
    }
    const MyCustomPie = (props: PieSectorShapeProps) => {
        const { payload } = props;
        const color = tagColors[payload.name.toLowerCase()] || tagColors["other"];
        return <Sector {...props} fill={color} />;
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
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Spending by Tag</h2>
                <p className="text-xs text-slate-500">Distribution of debits across categories</p>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={100}
                            paddingAngle={0}
                            dataKey="value"
                            label={renderCustomizedLabel}
                            labelLine={{ stroke: '#334155', strokeWidth: 1 }}
                            shape={MyCustomPie}
                        />

                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TagDistributionChart;
