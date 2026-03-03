import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import AppLogo from "./AppLogo";
import DropZone from "./DropZone";
import PasswordInput from "./PasswordInput";
import AnalyzeButton from "./AnalyzeButton";

interface UploadScreenProps {
    onAnalyze: (file: File, password?: string) => void;
    isLoading: boolean;
    errorMessage?: string;
}

const UploadScreen = ({ onAnalyze, isLoading, errorMessage }: UploadScreenProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");

    const handleAnalyze = () => {
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
                    <div className="space-y-5">
                        {/* Drop Zone */}
                        <DropZone
                            selectedFile={selectedFile}
                            onFileSelect={setSelectedFile}
                        />

                        {/* Password Input */}
                        <PasswordInput value={password} onChange={setPassword} />

                        {/* Error Message */}
                        {errorMessage && (
                            <p className="text-sm text-rose-400 text-center">{errorMessage}</p>
                        )}

                        {/* Analyze Button */}
                        <AnalyzeButton
                            disabled={!selectedFile}
                            isLoading={isLoading}
                            onClick={handleAnalyze}
                        />
                    </div>
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
