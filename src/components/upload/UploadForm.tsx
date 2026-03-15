import React from 'react'
import DropZone from './DropZone'
import PasswordInput from './PasswordInput'
import type { PasswordInputHandle } from './PasswordInput'
import AnalyzeButton from './AnalyzeButton'
import { ShieldCheck } from 'lucide-react'

interface UploadFormProps {
    selectedFiles: File[];
    onFilesSelect: (files: File[]) => void;
    password: string;
    setPassword: (password: string) => void;
    isCheckingPassword: boolean;
    isPasswordProtected: boolean;
    passwordInputRef: React.RefObject<PasswordInputHandle | null>;
    handleAnalyze: (e?: React.BaseSyntheticEvent) => void;
    isLoading: boolean;
    errorMessage?: string;
}

const UploadForm = ({
    selectedFiles,
    onFilesSelect,
    password,
    setPassword,
    isCheckingPassword,
    isPasswordProtected,
    passwordInputRef,
    handleAnalyze,
    isLoading,
    errorMessage
}: UploadFormProps) => {
    return (
        <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Drop Zone */}
            <DropZone
                selectedFiles={selectedFiles}
                onFilesSelect={onFilesSelect}
            />

            {/* Password Input (Conditional) */}
            {isPasswordProtected && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>One or more PDFs require a password</span>
                    </div>
                    <PasswordInput
                        ref={passwordInputRef}
                        value={password}
                        onChange={setPassword}
                    />
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <p className="text-sm text-rose-400 text-center">{errorMessage}</p>
            )}

            {/* Analyze Button */}
            <AnalyzeButton
                disabled={selectedFiles.length === 0 || isCheckingPassword}
                isLoading={isLoading || isCheckingPassword}
                onClick={() => handleAnalyze()}
                loadingText={isCheckingPassword ? "Checking PDF…" : undefined}
            />
        </form>
    )
}

export default UploadForm