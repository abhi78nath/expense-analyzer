import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
}

const PasswordInput = ({ value, onChange }: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <label
                htmlFor="pdf-password"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400"
            >
                <Lock className="h-3.5 w-3.5" />
                PDF Password
                <span className="text-slate-500">(optional)</span>
            </label>
            <div className="relative group/input">
                <input
                    id="pdf-password"
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter password to unlock PDF"
                    className="
                        w-full rounded-xl border border-slate-700 bg-slate-900/60
                        px-4 py-3 pr-11 text-sm text-white placeholder-slate-500
                        outline-none transition-all duration-200
                        focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20
                        hover:border-slate-600
                    "
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                        absolute right-3 top-1/2 -translate-y-1/2
                        flex h-8 w-8 items-center justify-center
                        rounded-lg text-slate-500 transition-all duration-200
                        hover:bg-slate-800 hover:text-slate-300
                        focus:outline-none focus:ring-1 focus:ring-slate-700
                        cursor-pointer z-10
                    "
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;
