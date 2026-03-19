import { useState, useMemo, useEffect } from "react";
import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Filter,
    Search,
    X,
    Check,
    X as XIcon,
    Maximize2,
    Minimize2
} from "lucide-react";
import type { TransactionRow } from "@/utils/textParser";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { tagColors } from "@/lib/tagColors";
import { capitalize, getContrastColor } from "@/utils/colorUtils";
import { useExpenseAnalysisContext } from "@/components/providers/ExpenseAnalysisProvider";
import { getTransactionTags } from "@/utils/api";

interface RecentTransactionsProps {
    transactions: TransactionRow[];
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

type SortColumn = "date" | "amount";
type SortOrder = "asc" | "desc" | null;

const formatINR = (v: number) =>
    "₹" + Math.abs(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseTxnDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    return new Date(2000 + Number(year), Number(month) - 1, Number(day));
};

const RecentTransactions = ({ transactions, isMaximized, onToggleMaximize }: RecentTransactionsProps) => {
    const { handleUpdateTransactionTag, handleBulkUpdateTransactionTags } = useExpenseAnalysisContext();
    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingTags, setPendingTags] = useState<Record<string, string>>({});
    const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
    const [popoverInput, setPopoverInput] = useState("");
    const [defaultApiTags, setDefaultApiTags] = useState<string[]>([]);

    useEffect(() => {
        getTransactionTags()
            .then((data: any) => {
                if (Array.isArray(data)) {
                    const extracted = Array.from(new Set(data.map((d: any) => d.tag?.toLowerCase()).filter(Boolean)));
                    setDefaultApiTags(extracted as string[]);
                }
            })
            .catch(console.error);
    }, []);

    // Extract unique tags and sort them
    const uniqueTags = useMemo(() => {
        const tags = new Set<string>();
        transactions.forEach(t => {
            if (t.tag) tags.add(t.tag.toLowerCase());
        });
        return Array.from(tags).sort();
    }, [transactions]);

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        // Apply Tag Filter
        if (selectedTags.length > 0) {
            result = result.filter(t =>
                t.tag && selectedTags.includes(t.tag.toLowerCase())
            );
        }

        // Apply Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(t =>
                (t.transactionReference?.toLowerCase().includes(query)) ||
                (t.refNoOrChqNo?.toLowerCase().includes(query))
            );
        }

        // Apply Sorting
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
    }, [transactions, sortColumn, sortOrder, selectedTags, searchQuery]);

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

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const SortIcon = ({ column }: { column: SortColumn }) => {
        if (sortColumn !== column || !sortOrder) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />;
        return sortOrder === "asc" ? <ChevronUp className="ml-1 h-3 w-3 text-teal-400" /> : <ChevronDown className="ml-1 h-3 w-3 text-teal-400" />;
    };

    const confirmPendingTag = (id: string) => {
        if (pendingTags[id] === undefined) return;
        handleUpdateTransactionTag(id, pendingTags[id]);
        setPendingTags(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const rejectPendingTag = (id: string) => {
        setPendingTags(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const handleBulkConfirm = async () => {
        await handleBulkUpdateTransactionTags(pendingTags);
        setPendingTags({});
    };

    const handleBulkReset = () => {
        setPendingTags({});
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-white">
                        All Transactions
                    </h2>
                    <p className="text-xs text-slate-500">
                        Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
                    </p>
                </div>

                <div className="flex items-center gap-2 relative w-full md:w-auto">
                    {onToggleMaximize && (
                        <button
                            onClick={onToggleMaximize}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5 border border-slate-700"
                            title={isMaximized ? "Restore" : "Maximize"}
                        >
                            {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                            <span className="hidden sm:inline">{isMaximized ? "Restore" : "Maximize"}</span>
                        </button>
                    )}
                    {Object.keys(pendingTags).length > 0 && (
                        <>
                            <button
                                onClick={handleBulkConfirm}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors"
                            >
                                Confirm All
                            </button>
                            <button
                                onClick={handleBulkReset}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                            >
                                Reset All
                            </button>
                        </>
                    )}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search description or ref..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-xs h-9 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ScrollArea className={`w-full rounded-md border border-slate-800/50 ${isMaximized ? "h-[calc(100vh-280px)] min-h-[400px]" : "h-[400px]"}`}>
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
                            <TableHead className="text-center text-slate-400 w-[150px]">
                                <div className="flex items-center justify-center gap-2">
                                    <span>Tags</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className={`p-1 rounded-md transition-colors hover:bg-slate-800 ${selectedTags.length > 0 ? "text-teal-400" : "text-slate-500"}`}>
                                                <Filter className="h-3 w-3" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-56 p-0 bg-slate-900 border-slate-800" align="center">
                                            <Command className="bg-transparent">
                                                <CommandInput placeholder="Search tags..." className="h-8 text-xs" />
                                                <CommandList>
                                                    <CommandEmpty className="py-2 text-xs text-center text-slate-500">No tags found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {uniqueTags.map(tag => {
                                                            const isSelected = selectedTags.includes(tag);
                                                            const bgColor = tagColors[tag] || tagColors["other"];
                                                            const textColor = getContrastColor(bgColor);
                                                            return (
                                                                <CommandItem
                                                                    key={tag}
                                                                    onSelect={() => toggleTag(tag)}
                                                                    className="flex items-center gap-2 h-8 cursor-pointer hover:bg-slate-800"
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        className="h-3.5 w-3.5 border-slate-700 bg-transparent data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                                                                    />
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-none text-[10px] font-normal px-1.5 py-0"
                                                                        style={{
                                                                            backgroundColor: bgColor,
                                                                            color: textColor
                                                                        }}
                                                                    >
                                                                        {capitalize(tag)}
                                                                    </Badge>
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                    {selectedTags.length > 0 && (
                                                        <>
                                                            <CommandSeparator className="bg-slate-800" />
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    onSelect={() => setSelectedTags([])}
                                                                    className="justify-center text-[10px] text-rose-400 h-8 cursor-pointer hover:bg-rose-500/10 font-medium"
                                                                >
                                                                    Clear all filters
                                                                </CommandItem>
                                                            </CommandGroup>
                                                        </>
                                                    )}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedTransactions.map((t, idx) => {
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
                                        <div className="flex items-center justify-center gap-1.5">
                                            {(() => {
                                                const hasPending = pendingTags[t.id] !== undefined;
                                                const displayedTag = hasPending ? pendingTags[t.id] : t.tag;

                                                let tagContent;
                                                if (displayedTag) {
                                                    const bgColor = tagColors[displayedTag.toLowerCase()] || tagColors["other"];
                                                    const textColor = getContrastColor(bgColor);
                                                    tagContent = (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-none text-xs font-normal px-2 py-0 cursor-pointer hover:opacity-80 transition-opacity"
                                                            style={{
                                                                backgroundColor: bgColor,
                                                                color: textColor
                                                            }}
                                                        >
                                                            {capitalize(displayedTag)}
                                                        </Badge>
                                                    );
                                                } else {
                                                    tagContent = <span className="text-sm text-slate-500 font-mono cursor-pointer hover:text-slate-300 transition-colors">-</span>;
                                                }

                                                return (
                                                    <>
                                                        <Popover
                                                            open={openPopoverId === t.id}
                                                            onOpenChange={(isOpen) => {
                                                                if (isOpen) {
                                                                    setPopoverInput(displayedTag || "");
                                                                    setOpenPopoverId(t.id);
                                                                } else {
                                                                    setOpenPopoverId(null);
                                                                }
                                                            }}
                                                        >
                                                            <PopoverTrigger asChild>
                                                                {tagContent}
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-56 p-2 bg-slate-900 border-slate-800" align="center">
                                                                <div className="flex flex-col gap-2">
                                                                    <p className="text-xs font-medium text-slate-300">Edit Tag</p>
                                                                    <Input
                                                                        autoFocus
                                                                        value={popoverInput}
                                                                        onChange={(e) => setPopoverInput(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === "Enter") {
                                                                                setPendingTags(prev => ({ ...prev, [t.id]: popoverInput.trim() || "other" }));
                                                                                setOpenPopoverId(null);
                                                                            }
                                                                        }}
                                                                        placeholder="Type tag name..."
                                                                        className="h-8 text-xs bg-slate-800 border-slate-700 text-white"
                                                                    />
                                                                    <div className="max-h-[120px] overflow-y-auto mt-1 flex flex-col gap-0.5 custom-scrollbar bg-slate-900 border border-slate-800 rounded-md">
                                                                        {Array.from(new Set([...defaultApiTags, ...uniqueTags]))
                                                                            .filter(tag => tag.includes(popoverInput.toLowerCase().trim()))
                                                                            .sort()
                                                                            .map(tag => (
                                                                                <div
                                                                                    key={tag}
                                                                                    onClick={() => {
                                                                                        setPendingTags(prev => ({ ...prev, [t.id]: tag }));
                                                                                        setOpenPopoverId(null);
                                                                                    }}
                                                                                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                                                                                >
                                                                                    {capitalize(tag)}
                                                                                </div>
                                                                            ))
                                                                        }
                                                                    </div>
                                                                    <div className="flex justify-between items-center mt-1">
                                                                        <span className="text-[10px] text-slate-500">Press enter to save locally</span>
                                                                        <button
                                                                            onClick={() => {
                                                                                setPendingTags(prev => ({ ...prev, [t.id]: popoverInput.trim() || "other" }));
                                                                                setOpenPopoverId(null);
                                                                            }}
                                                                            className="px-2 py-1 text-xs bg-teal-500 hover:bg-teal-400 text-white rounded transition-colors"
                                                                        >
                                                                            Apply
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        {hasPending && (
                                                            <div className="flex items-center gap-1 opacity-80 pl-1">
                                                                <button
                                                                    onClick={() => confirmPendingTag(t.id)}
                                                                    className="p-0.5 rounded-full hover:bg-teal-500/20 text-teal-400 transition-colors"
                                                                    title="Confirm edit"
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => rejectPendingTag(t.id)}
                                                                    className="p-0.5 rounded-full hover:bg-rose-500/20 text-rose-400 transition-colors"
                                                                    title="Discard edit"
                                                                >
                                                                    <XIcon className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
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
