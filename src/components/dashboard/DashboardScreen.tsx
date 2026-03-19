import { SidebarProvider } from "./SidebarContext";
import DashboardLayout from "./DashboardLayout";
import DashboardHeader from "./DashboardHeader";
import BalanceCardsRow from "./BalanceCardsRow";
import CreditsDebitsChart from "./CreditsDebitsChart";
import TagDistributionChart from "./TagDistributionChart";
import RecentTransactions from "./RecentTransactions";
import type { TransactionRow } from "@/utils/textParser";
import type { RootState } from "@/shared/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { useState, useMemo, useEffect, memo } from "react";
import { useAuth } from "@clerk/react";
import { startOfMonth, endOfMonth } from "date-fns";
import { setDateRange } from "@/shared/redux/features";
import { useExpenseAnalysisContext } from "../providers/ExpenseAnalysisProvider";
import { useNavigate } from "react-router-dom";
import { Maximize2, BarChart2 } from "lucide-react";

interface DashboardScreenProps {
    transactions: TransactionRow[];
    uploadedFiles: File[];
    onBackToUpload?: () => void;
    onAnalyze: (files: File[], password?: string, isAppend?: boolean) => Promise<boolean>;
    isParsing: boolean;
    errorMessage?: string;
}

const DashboardScreen = memo(() => {
    const { transactionRows: transactions, uploadedFiles, handleAnalyze, isParsing, errorMessage, handleBackToUpload, loadOfflineData } = useExpenseAnalysisContext();
    const dateRange = useSelector((state: RootState) => state.dateRange.dateRange);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoaded, isSignedIn, userId } = useAuth();
    const [isCheckingData, setIsCheckingData] = useState(true);
    const [isTransactionsMaximized, setIsTransactionsMaximized] = useState(false);

    useEffect(() => {
        const initData = async () => {
            if (isLoaded && isSignedIn && userId && transactions.length === 0) {
                const hasData = await loadOfflineData(userId);
                if (!hasData) {
                    navigate('/', { replace: true });
                }
            } else if (isLoaded && !isSignedIn && transactions.length === 0) {
                navigate('/', { replace: true });
            }
            if (isLoaded) {
                setIsCheckingData(false);
            }
        };
        initData();
    }, [isLoaded, isSignedIn, userId, transactions.length, navigate, loadOfflineData]);

    useEffect(() => {
        // Initialize or expand date range if we have transactions
        if (transactions.length > 0) {
            const parseTxnDate = (dateStr: string) => {
                const [day, month, year] = dateStr.split("-");
                return new Date(2000 + Number(year), Number(month) - 1, Number(day));
            };

            let minTime = Infinity;
            let maxTime = -Infinity;

            transactions.forEach(txn => {
                if (!txn.date) return;
                const date = parseTxnDate(txn.date);
                const time = date.getTime();
                if (time < minTime) minTime = time;
                if (time > maxTime) maxTime = time;
            });

            if (minTime !== Infinity && maxTime !== -Infinity) {
                const start = startOfMonth(new Date(minTime));
                const end = endOfMonth(new Date(maxTime));

                // Only update if the range has actually expanded or wasn't set
                if (!dateRange || !dateRange.from || !dateRange.to ||
                    start.getTime() < new Date(dateRange.from).getTime() ||
                    end.getTime() > new Date(dateRange.to).getTime()) {

                    dispatch(setDateRange({
                        from: start,
                        to: end
                    }));
                }
            }
        }
    }, [transactions, dateRange, dispatch]);

    console.log(dateRange, 'dateRange')

    const filteredTransactions = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return transactions;

        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);

        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        const parseTxnDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split("-");
            return new Date(2000 + Number(year), Number(month) - 1, Number(day));
        };

        return transactions.filter((txn) => {
            const txnDate = parseTxnDate(txn.date);
            return txnDate >= fromDate && txnDate <= toDate;
        });

    }, [dateRange, transactions]);

    const stableTransactions = useMemo(() => filteredTransactions, [filteredTransactions]);

    if (isCheckingData) {
        return <div className="flex h-screen w-full items-center justify-center font-semibold text-slate-400">Loading your dashboard...</div>;
    }

    console.log(filteredTransactions, 'filteredTransactions')
    return (
        <SidebarProvider>
            <DashboardLayout>
                <DashboardHeader
                    onBackToUpload={handleBackToUpload}
                    onAnalyze={handleAnalyze}
                    isParsing={isParsing}
                    errorMessage={errorMessage}
                    uploadedFiles={uploadedFiles}
                />
                <BalanceCardsRow transactions={filteredTransactions} />
                {!isTransactionsMaximized ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-2">
                            <CreditsDebitsChart transactions={filteredTransactions} />
                        </div>
                        <div className="lg:col-span-1">
                            <TagDistributionChart transactions={stableTransactions} />
                        </div>
                    </div>
                ) : (
                    <div className="flex bg-slate-800/50 border border-slate-700/60 rounded-2xl items-center justify-between px-6 py-3 mb-6 transition-all">
                        <div className="flex items-center gap-3">
                            <BarChart2 className="h-5 w-5 text-teal-400" />
                            <span className="text-slate-300 font-medium text-sm">Charts Collapsed</span>
                        </div>
                        <button
                            onClick={() => setIsTransactionsMaximized(false)}
                            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors flex items-center gap-2"
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                            Maximize Charts
                        </button>
                    </div>
                )}
                <RecentTransactions
                    transactions={filteredTransactions}
                    isMaximized={isTransactionsMaximized}
                    onToggleMaximize={() => setIsTransactionsMaximized(!isTransactionsMaximized)}
                />
            </DashboardLayout>
        </SidebarProvider>
    );
});

export default DashboardScreen;
