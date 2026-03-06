import { useState, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { pdfjs } from "react-pdf";
import AnimatedBackground from "./AnimatedBackground";
import AppLogo from "./AppLogo";
import DropZone from "./DropZone";
import PasswordInput from "./PasswordInput";
import type { PasswordInputHandle } from "./PasswordInput";
import AnalyzeButton from "./AnalyzeButton";

interface UploadScreenProps {
    onAnalyze: (file: File, password?: string) => void;
    isLoading: boolean;
    errorMessage?: string;
}

const UploadScreen = ({ onAnalyze, isLoading, errorMessage }: UploadScreenProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [isCheckingPassword, setIsCheckingPassword] = useState(false);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const passwordInputRef = useRef<PasswordInputHandle>(null);

    const handleFileSelect = async (file: File | null) => {
        if (!file) {
            setSelectedFile(null);
            setIsPasswordProtected(false);
            return;
        }

        setSelectedFile(file);
        setIsCheckingPassword(true);
        setIsPasswordProtected(false); // Reset on new selection

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });

            try {
                await loadingTask.promise;
                // No password required
                setIsPasswordProtected(false);
            } catch (pdfError: any) {
                if (
                    pdfError.name === "PasswordException" ||
                    (pdfError.message && pdfError.message.toLowerCase().includes("password"))
                ) {
                    setIsPasswordProtected(true);
                    // Small delay to ensure input is rendered before focusing
                    setTimeout(() => {
                        passwordInputRef.current?.focus();
                    }, 50);
                } else {
                    console.error("PDF check error:", pdfError);
                }
            }
        } catch (err) {
            console.error("Error checking PDF:", err);
        } finally {
            setIsCheckingPassword(false);
        }
    };

    const handleAnalyze = (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        if (!selectedFile) return;
        onAnalyze(selectedFile, password || undefined);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
            <AnimatedBackground />

            <div className="w-full max-w-md">
                {/* Logo + Title */}
                <AppLogo />

                {/* Glassmorphic Card */}
                <div
                    className="rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl shadow-black/20"
                    style={{
                        background: "rgba(30, 41, 59, 0.50)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                    }}
                >
                    <form onSubmit={handleAnalyze} className="space-y-5">
                        {/* Drop Zone */}
                        <DropZone
                            selectedFile={selectedFile}
                            onFileSelect={handleFileSelect}
                        />

                        {/* Password Input (Conditional) */}
                        {isPasswordProtected && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs font-medium">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>The uploaded PDF requires a password</span>
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
                            disabled={!selectedFile || isCheckingPassword}
                            isLoading={isLoading || isCheckingPassword}
                            onClick={() => handleAnalyze()}
                            loadingText={isCheckingPassword ? "Checking PDF…" : undefined}
                        />
                    </form>
                </div>

                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Your data is processed securely</span>
                </div>
            </div>
        </div>
    );
};

export default UploadScreen;
