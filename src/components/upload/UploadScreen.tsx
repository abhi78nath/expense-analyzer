import { useState, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { pdfjs } from "react-pdf";
import AnimatedBackground from "./AnimatedBackground";
import AppLogo from "./AppLogo";
import type { PasswordInputHandle } from "./PasswordInput";
import UploadForm from "./UploadForm";
import Navbar from "../layout/Navbar";

interface UploadScreenProps {
    onAnalyze: (files: File[], password?: string) => void;
    isLoading: boolean;
    errorMessage?: string;
}

const UploadScreen = ({ onAnalyze, isLoading, errorMessage }: UploadScreenProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [password, setPassword] = useState("");
    const [isCheckingPassword, setIsCheckingPassword] = useState(false);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const passwordInputRef = useRef<PasswordInputHandle>(null);

    const handleFilesSelect = async (files: File[]) => {
        if (files.length === 0) {
            setSelectedFiles([]);
            setIsPasswordProtected(false);
            return;
        }

        setSelectedFiles(files);
        setIsCheckingPassword(true);
        setIsPasswordProtected(false); // Reset on new selection

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
                        break; // If even one is protected, we need a password
                    } else {
                        console.error(`PDF check error for ${file.name}:`, pdfError);
                    }
                }
            }

            if (anyProtected) {
                setIsPasswordProtected(true);
                // Small delay to ensure input is rendered before focusing
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

    const handleAnalyze = (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        if (selectedFiles.length === 0) return;
        onAnalyze(selectedFiles, password || undefined);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-8 pt-24">
            <AnimatedBackground />
            <Navbar />

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
                    <UploadForm
                        selectedFiles={selectedFiles}
                        onFilesSelect={handleFilesSelect}
                        password={password}
                        setPassword={setPassword}
                        isCheckingPassword={isCheckingPassword}
                        isPasswordProtected={isPasswordProtected}
                        passwordInputRef={passwordInputRef}
                        handleAnalyze={handleAnalyze}
                        isLoading={isLoading}
                        errorMessage={errorMessage}
                    />
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
