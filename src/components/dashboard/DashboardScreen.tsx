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
import { useMemo, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { setDateRange } from "@/shared/redux/features";

interface DashboardScreenProps {
    transactions: TransactionRow[];
    uploadedFiles: File[];
    onBackToUpload?: () => void;
    onAnalyze: (files: File[], password?: string, isAppend?: boolean) => Promise<boolean>;
    isParsing: boolean;
    errorMessage?: string;
}

const DashboardScreen = ({
    transactions,
    uploadedFiles,
    onBackToUpload,
    onAnalyze,
    isParsing,
    errorMessage
}: DashboardScreenProps) => {

    const dateRange = useSelector((state: RootState) => state.dateRange.dateRange);
    const dispatch = useDispatch();

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

    console.log(filteredTransactions, 'filteredTransactions')
    return (
        <SidebarProvider>
            <DashboardLayout>
                <DashboardHeader
                    onBackToUpload={onBackToUpload}
                    onAnalyze={onAnalyze}
                    isParsing={isParsing}
                    errorMessage={errorMessage}
                    uploadedFiles={uploadedFiles}
                />
                <BalanceCardsRow transactions={filteredTransactions} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <CreditsDebitsChart transactions={filteredTransactions} />
                    </div>
                    <div className="lg:col-span-1">
                        <TagDistributionChart transactions={filteredTransactions} />
                    </div>
                </div>
                <RecentTransactions transactions={filteredTransactions} />
            </DashboardLayout>
        </SidebarProvider>
    );
};

export default DashboardScreen;
