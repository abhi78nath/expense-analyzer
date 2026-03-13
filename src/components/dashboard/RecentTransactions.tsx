import { useState, useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { TransactionRow } from "@/utils/textParser";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { tagColors } from "@/lib/tagColors";
import { capitalize, getContrastColor } from "@/utils/colorUtils";

interface RecentTransactionsProps {
    transactions: TransactionRow[];
}

type SortColumn = "date" | "amount";
type SortOrder = "asc" | "desc" | null;

const formatINR = (v: number) =>
    "₹" + Math.abs(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseTxnDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    return new Date(2000 + Number(year), Number(month) - 1, Number(day));
};

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    const sortedTransactions = useMemo(() => {
        let result = [...transactions];

        if (sortColumn && sortOrder) {
            result.sort((a, b) => {
                if (sortColumn === "date") {
                    const dateA = parseTxnDate(a.date).getTime();
                    const dateB = parseTxnDate(b.date).getTime();
                    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                }
                if (sortColumn === "amount") {
                    const amountA = (a.credit ?? 0) - (a.debit ?? 0);
                    const amountB = (b.credit ?? 0) - (b.debit ?? 0);
                    return sortOrder === "asc" ? amountA - amountB : amountB - amountA;
                }
                return 0;
            });
        } else {
            // Default: newest first
            result.reverse();
        }

        return result;
    }, [transactions, sortColumn, sortOrder]);

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            if (sortOrder === "asc") setSortOrder("desc");
            else if (sortOrder === "desc") {
                setSortColumn(null);
                setSortOrder(null);
            }
            else setSortOrder("asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    const SortIcon = ({ column }: { column: SortColumn }) => {
        if (sortColumn !== column || !sortOrder) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />;
        return sortOrder === "asc" ? <ChevronUp className="ml-1 h-3 w-3 text-teal-400" /> : <ChevronDown className="ml-1 h-3 w-3 text-teal-400" />;
    };

    if (transactions.length === 0) {
        return null;
    }

    return (
        <div
            className="rounded-2xl border border-slate-700/60 p-6"
            style={{
                background: "rgba(30, 41, 59, 0.50)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
            }}
        >
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">
                    All Transactions
                </h2>
                <p className="text-xs text-slate-500">
                    Showing {transactions.length} transactions from your statement
                </p>
            </div>

            <ScrollArea className="h-[400px] w-full rounded-md border border-slate-800/50">
                <Table>
                    <TableHeader className="bg-slate-900 sticky top-0 z-10">
                        <TableRow className="hover:bg-transparent border-slate-800">
                            <TableHead
                                className="w-[120px] text-slate-400 cursor-pointer hover:text-slate-200 transition-colors select-none"
                                onClick={() => handleSort("date")}
                            >
                                <div className="flex items-center">
                                    Date <SortIcon column="date" />
                                </div>
                            </TableHead>
                            <TableHead className="text-slate-400">Description</TableHead>
                            <TableHead className="text-slate-400">Ref / Chq</TableHead>
                            <TableHead
                                className="text-right text-slate-400 cursor-pointer hover:text-slate-200 transition-colors select-none"
                                onClick={() => handleSort("amount")}
                            >
                                <div className="flex items-center justify-end">
                                    Amount <SortIcon column="amount" />
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-slate-400">Tags</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTransactions.map((t, idx) => {
                            const isCredit = (t.credit ?? 0) > 0;
                            const amount = isCredit ? t.credit! : t.debit ?? 0;

                            return (
                                <TableRow
                                    key={idx}
                                    className="border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                >
                                    <TableCell className="text-xs font-medium text-slate-300">
                                        {t.date}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isCredit ? "bg-teal-500/10" : "bg-rose-500/10"
                                                    }`}
                                            >
                                                {isCredit ? (
                                                    <ArrowDownRight className="h-3 w-3 text-teal-400" />
                                                ) : (
                                                    <ArrowUpRight className="h-3 w-3 text-rose-400" />
                                                )}
                                            </div>
                                            <span className="text-xs text-white max-w-[400px] block">
                                                {t.transactionReference || "Transaction"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[10px] text-slate-500 font-mono">
                                        {t.refNoOrChqNo || "-"}
                                    </TableCell>
                                    <TableCell className={`text-right text-xs font-semibold ${isCredit ? "text-teal-400" : "text-slate-200"
                                        }`}>
                                        <div className="flex flex-col items-end">
                                            <span>
                                                {isCredit ? "+" : "-"} {formatINR(amount)}
                                            </span>
                                            {t.balance !== null && (
                                                <span className="text-[9px] text-slate-600 font-normal">
                                                    Bal: {formatINR(t.balance)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {t.tag ? (
                                            (() => {
                                                const bgColor = tagColors[t.tag.toLowerCase()] || tagColors["other"];
                                                const textColor = getContrastColor(bgColor);
                                                return (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-none text-xs font-bold px-2 py-0"
                                                        style={{
                                                            backgroundColor: bgColor,
                                                            color: textColor
                                                        }}
                                                    >
                                                        {capitalize(t.tag)}
                                                    </Badge>
                                                );
                                            })()
                                        ) : (
                                            <span className="text-sm text-slate-500 font-mono">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
};

export default RecentTransactions;
