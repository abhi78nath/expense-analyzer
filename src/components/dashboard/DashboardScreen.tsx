import { SidebarProvider } from "./SidebarContext";
import DashboardLayout from "./DashboardLayout";
import DashboardHeader from "./DashboardHeader";
import BalanceCardsRow from "./BalanceCardsRow";
import CreditsDebitsChart from "./CreditsDebitsChart";
import RecentTransactions from "./RecentTransactions";
import type { TransactionRow } from "@/utils/textParser";
import type { RootState } from "@/shared/redux/store";
import { useSelector } from "react-redux";
import { useMemo } from "react";

interface DashboardScreenProps {
    transactions: TransactionRow[];
    onBackToUpload?: () => void;
}

const DashboardScreen = ({ transactions, onBackToUpload }: DashboardScreenProps) => {

    const dateRange = useSelector((state: RootState) => state.dateRange.dateRange);
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

    return (
        <SidebarProvider>
            <DashboardLayout>
                <DashboardHeader onBackToUpload={onBackToUpload} />
                <BalanceCardsRow transactions={filteredTransactions} />
                <CreditsDebitsChart transactions={filteredTransactions} />
                <RecentTransactions transactions={filteredTransactions} />
            </DashboardLayout>
        </SidebarProvider>
    );
};

export default DashboardScreen;
