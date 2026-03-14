import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import BalanceCard from "./BalanceCard";
import type { TransactionRow } from "@/utils/textParser";

interface BalanceCardsRowProps {
    transactions: TransactionRow[];
}

const BalanceCardsRow = ({ transactions }: BalanceCardsRowProps) => {
    const totalCredits = transactions.reduce(
        (sum, t) => sum + (t.credit ?? 0),
        0
    );
    const totalDebits = transactions.reduce(
        (sum, t) => sum + (t.debit ?? 0),
        0
    );

    // Last non-null balance in the data
    const lastBalance =
        [...transactions].reverse().find((t) => t.balance !== null)?.balance ?? 0;

    // Calculate approximate month-over-month change
    const changePercent =
        totalCredits > 0
            ? (((totalCredits - totalDebits) / totalCredits) * 100).toFixed(1)
            : "0";

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <BalanceCard
                icon={Wallet}
                label="Total Balance"
                amount={lastBalance}
                subtitle=""
                accentColor="emerald"
                changeText={`${Number(changePercent) >= 0 ? "+" : ""}${changePercent}% this month`}
                changePositive={Number(changePercent) >= 0}
            />
            <BalanceCard
                icon={TrendingUp}
                label="Total Credits"
                amount={totalCredits}
                subtitle="Income received"
                accentColor="teal"
            />
            <BalanceCard
                icon={TrendingDown}
                label="Total Debits"
                amount={totalDebits}
                subtitle="Total expenses"
                accentColor="rose"
            />
        </div>
    );
};

export default BalanceCardsRow;
