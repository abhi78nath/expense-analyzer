import { SidebarProvider } from "./SidebarContext";
import DashboardLayout from "./DashboardLayout";
import DashboardHeader from "./DashboardHeader";
import BalanceCardsRow from "./BalanceCardsRow";
import CreditsDebitsChart from "./CreditsDebitsChart";
import RecentTransactions from "./RecentTransactions";
import type { TransactionRow } from "@/utils/textParser";

interface DashboardScreenProps {
    transactions: TransactionRow[];
    onBackToUpload?: () => void;
}

const DashboardScreen = ({ transactions, onBackToUpload }: DashboardScreenProps) => {
    return (
        <SidebarProvider>
            <DashboardLayout>
                <DashboardHeader onBackToUpload={onBackToUpload} />
                <BalanceCardsRow transactions={transactions} />
                <CreditsDebitsChart transactions={transactions} />
                <RecentTransactions transactions={transactions} />
            </DashboardLayout>
        </SidebarProvider>
    );
};

export default DashboardScreen;
