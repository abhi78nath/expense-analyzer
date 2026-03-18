import { createContext, useContext } from 'react';
import { useExpenseAnalysis } from '../../hooks/useExpenseAnalysis';

const ExpenseAnalysisContext = createContext<ReturnType<typeof useExpenseAnalysis> | null>(null);

export const ExpenseAnalysisProviders = ({ children }: { children: React.ReactNode }) => {
    // const userIdRef = useStableUserId();
    const value = useExpenseAnalysis();

    return (
        <ExpenseAnalysisContext.Provider value={value} >
            {children}
        </ExpenseAnalysisContext.Provider>
    );
};

export const useExpenseAnalysisContext = () => {
    const ctx = useContext(ExpenseAnalysisContext);
    if (!ctx) throw new Error('useExpenseAnalysisContext must be used within ExpenseAnalysisProvider');
    return ctx;
};