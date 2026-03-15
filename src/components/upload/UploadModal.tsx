import React, { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, CheckCircle2 } from "lucide-react"
import UploadForm from "./UploadForm"
import { pdfjs } from "react-pdf"
import type { PasswordInputHandle } from "./PasswordInput"

interface UploadModalProps {
    onAnalyze: (files: File[], password?: string, isAppend?: boolean) => Promise<boolean>;
    isLoading: boolean;
    errorMessage?: string;
    existingFiles?: File[];
}

const UploadModal = ({ onAnalyze, isLoading, errorMessage, existingFiles = [] }: UploadModalProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [password, setPassword] = useState("");
    const [isCheckingPassword, setIsCheckingPassword] = useState(false);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const passwordInputRef = useRef<PasswordInputHandle>(null);

    const handleFilesSelect = async (files: File[]) => {
        if (files.length === 0) {
            setSelectedFiles([]);
            setIsPasswordProtected(false);
            return;
        }

        setSelectedFiles(files);
        setIsCheckingPassword(true);
        setIsPasswordProtected(false);

        let anyProtected = false;

        try {
            for (const file of files) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                    await loadingTask.promise;
                } catch (pdfError: any) {
                    if (
                        pdfError.name === "PasswordException" ||
                        (pdfError.message && pdfError.message.toLowerCase().includes("password"))
                    ) {
                        anyProtected = true;
                        break;
                    }
                }
            }

            if (anyProtected) {
                setIsPasswordProtected(true);
                setTimeout(() => {
                    passwordInputRef.current?.focus();
                }, 50);
            }
        } catch (err) {
            console.error("Error checking PDFs:", err);
        } finally {
            setIsCheckingPassword(false);
        }
    };

    const handleAnalyzeClick = async (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        if (selectedFiles.length === 0) return;

        const success = await onAnalyze(selectedFiles, password || undefined, true);

        if (success) {
            setIsOpen(false);
            resetState();
        }
    };

    const resetState = () => {
        setSelectedFiles([]);
        setPassword("");
        setIsPasswordProtected(false);
        setIsCheckingPassword(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetState();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer gap-1.5"
                >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Statement
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900/95 border-slate-800 backdrop-blur-xl text-white">
                <DialogHeader>
                    <DialogTitle>Add New Statement</DialogTitle>
                </DialogHeader>

                {existingFiles.length > 0 && (
                    <div className="mt-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
                        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Previously Uploaded ({existingFiles.length})
                        </h4>
                        <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            <TooltipProvider delayDuration={200}>
                                {existingFiles.map((file, idx) => (
                                    <Tooltip key={`${file.name}-${idx}`}>
                                        <TooltipTrigger asChild>
                                            <div className="group relative flex flex-col gap-1 rounded-lg border border-slate-800/40 bg-slate-900/40 p-2 transition-colors hover:border-slate-700/60 hover:bg-slate-900/60 cursor-default">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <FileText className="h-3 w-3 text-emerald-400 shrink-0" />
                                                    <span className="truncate text-[11px] text-slate-300 font-medium leading-tight">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs px-3 py-2 shadow-xl">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-semibold break-all">{file.name}</p>
                                                <p className="text-slate-400 text-[10px]">Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>
                    </div>
                )}

                <div className="py-2">
                    <UploadForm
                        selectedFiles={selectedFiles}
                        onFilesSelect={handleFilesSelect}
                        password={password}
                        setPassword={setPassword}
                        isCheckingPassword={isCheckingPassword}
                        isPasswordProtected={isPasswordProtected}
                        passwordInputRef={passwordInputRef}
                        handleAnalyze={handleAnalyzeClick}
                        isLoading={isLoading}
                        errorMessage={errorMessage}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UploadModal
