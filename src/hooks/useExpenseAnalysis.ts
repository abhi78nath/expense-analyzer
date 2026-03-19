import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { pdfjs } from 'react-pdf';
import { useAuth } from '@clerk/react';
import { setDateRange } from '../shared/redux/features';
import { parsePdfWithPython } from '../utils/api';
import { findDuplicateStatement, mapToTransactionRecord, saveStatementRecord, saveTransactions, type StatementRecord, type TransactionRecord } from '../utils/db';
import type { TransactionRow } from '../utils/textParser';

// At the top of useExpenseAnalysis.ts, before the hook
declare global {
    interface Window {
        Clerk?: {
            user?: {
                id?: string;
            };
        };
    }
}
export const useExpenseAnalysis = () => {
    const [transactionRows, setTransactionRows] = useState<TransactionRow[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleAnalyze = async (files: File[], password?: string, isAppend: boolean = false) => {
        const currentUserId = window.Clerk?.user?.id ?? null;
        setIsParsing(true);
        setErrorMessage('');

        if (!isAppend) {
            setTransactionRows([]);
            setUploadedFiles(files);
            dispatch(setDateRange(undefined));
        }

        try {
            // Check each file for password protection
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer, password });

                try {
                    await loadingTask.promise;
                } catch (pdfError: any) {
                    if (
                        pdfError.name === 'PasswordException' ||
                        (pdfError.message && pdfError.message.toLowerCase().includes('password'))
                    ) {
                        setErrorMessage(`File "${file.name}" is password protected. Please provide the correct password.`);
                        setIsParsing(false);
                        return false;
                    }
                    throw pdfError;
                }
            }

            const response = await parsePdfWithPython(files, currentUserId, password);

            const rows: TransactionRow[] = response.transactions.map((t: any) => ({
                date: String(t["date"] || ""),
                transactionReference: String(t["transaction reference"] || ""),
                refNoOrChqNo: String(t["ref.no/chq.no"] || ""),
                debit: typeof t["debit"] === "number" ? t["debit"] : null,
                credit: typeof t["credit"] === "number" ? t["credit"] : null,
                balance: typeof t["balance"] === "number" ? t["balance"] : null,
                tag: t["tag"] || "other"
            }));

            if (currentUserId && response.metadata?.pdfs) {
                for (const pdf of response.metadata.pdfs as any[]) {
                    const pdfTxns = response.transactions.filter((t: any) => t.pdf_id === pdf.id);
                    if (pdfTxns.length === 0) continue;

                    let totalCredit = 0;
                    let totalDebit = 0;
                    const dates: string[] = [];

                    pdfTxns.forEach((t: any) => {
                        if (typeof t.credit === 'number') totalCredit += t.credit;
                        if (typeof t.debit === 'number') totalDebit += t.debit;
                        // Some basic parse mapping: date strings need to be uniform
                        if (t.date) dates.push(t.date);
                    });

                    // Very simple string sort, assumes date strings are parseable
                    dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                    const periodStart = dates[0] || '';
                    const periodEnd = dates[dates.length - 1] || '';

                    // Try to guess a bank name from filename or default to Unknown
                    // const bankNameLower = pdf.filename.toLowerCase();
                    // let bankName = 'Unknown Bank';
                    // if (bankNameLower.includes('hdfc')) bankName = 'HDFC';
                    // else if (bankNameLower.includes('sbi')) bankName = 'SBI';
                    // else if (bankNameLower.includes('icici')) bankName = 'ICICI';
                    // else if (bankNameLower.includes('axis')) bankName = 'Axis Bank';
                    let bankName = response.metadata?.bank_name || "Unknown Bank";
                    const duplicate = await findDuplicateStatement(
                        currentUserId,
                        bankName,
                        periodStart,
                        periodEnd
                    );

                    if (duplicate) {
                        console.warn(`[upload] Duplicate statement skipped: ${pdf.filename}`);
                        continue; // skip this PDF, process remaining files
                    }
                    const record: StatementRecord = {
                        id: pdf.id,
                        userId: currentUserId,
                        fileName: pdf.filename,
                        uploadedAt: new Date().toISOString(),
                        bankName: bankName,
                        periodStart,
                        periodEnd,
                        totalCredit,
                        totalDebit,
                        currency: 'INR'
                    };
                    await saveStatementRecord(record).catch(err => console.error("Error saving statement to DB", err));

                    const transactions: TransactionRecord[] = pdfTxns.map((t: any) =>
                        mapToTransactionRecord(t, currentUserId, pdf.id)
                    );

                    await saveTransactions(transactions);
                }
            }

            if (isAppend) {
                setTransactionRows(prev => [...prev, ...rows]);
                setUploadedFiles(prev => [...prev, ...files]);
            } else {
                setTransactionRows(rows);
                navigate('/dashboard');
            }
            return true;
        } catch (error: any) {
            console.error('Error parsing PDF:', error);
            if (error.message?.includes('401') || error.message?.toLowerCase().includes('password')) {
                setErrorMessage('Password failed for one or more files. Please try again.');
            } else {
                setErrorMessage(error.message || 'Failed to parse PDF(s).');
            }
            return false;
        } finally {
            setIsParsing(false);
        }
    };

    const handleBackToUpload = () => {
        setTransactionRows([]);
        setUploadedFiles([]);
        setErrorMessage('');
        dispatch(setDateRange(undefined));
        navigate('/');
    };

    return {
        transactionRows,
        uploadedFiles,
        isParsing,
        errorMessage,
        handleAnalyze,
        handleBackToUpload
    };
};

