import { Tag, AlertCircle, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { tagColors } from '@/lib/tagColors';
import type { MerchantRule } from '@/shared/types/merchant';

interface TagsSectionProps {
    rules: MerchantRule[] | null;
    loading: boolean;
    error: string | null;
    onEdit: (rule: MerchantRule) => void;
    onDelete: (id: number) => void;
}

const TagsSection = ({ rules, loading, error, onEdit, onDelete }: TagsSectionProps) => {
    const getTagColor = (tagName: string) => {
        const color = tagColors[tagName.toLowerCase()] || tagColors["other"];
        return color;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Loading categorization rules...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/20 flex items-center gap-4 shadow-sm">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <div>
                        <p className="font-bold">Error loading rules</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-1 sm:p-6 animate-in fade-in duration-500 space-y-6">
            {!rules || rules.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <p className="text-slate-500 font-medium">No merchant rules available.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                <TableHead className="w-[40%] font-bold text-slate-900 dark:text-white py-4">Merchant</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-white py-4">Category</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-white py-4">Default Tag</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-white py-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule, index) => {
                                const color = getTagColor(rule.tag);
                                return (
                                    <TableRow
                                        key={`${rule.merchant}-${index}`}
                                        className="group border-slate-100 dark:border-slate-800/50 hover:bg-emerald-500/5 transition-colors"
                                    >
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                                    <Tag className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-white">{rule.merchant}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium px-2.5 py-0.5 rounded-lg">
                                                {rule.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                className="border-none shadow-none font-bold px-2.5 py-0.5 rounded-lg"
                                                style={{
                                                    backgroundColor: `${color}20`,
                                                    color: color
                                                }}
                                            >
                                                {rule.tag}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => onEdit(rule)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => onDelete(rule.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};


export default TagsSection;