import { Lock } from "lucide-react";

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
}

const PasswordInput = ({ value, onChange }: PasswordInputProps) => {
    return (
        <div className="space-y-2">
            <label
                htmlFor="pdf-password"
                className="flex items-center gap-1.5 text-xs font-medium text-[#94a3b8]"
            >
                <Lock className="h-3.5 w-3.5" />
                PDF Password
                <span className="text-[#475569]">(optional)</span>
            </label>
            <input
                id="pdf-password"
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter password to unlock PDF"
                className="
          w-full rounded-xl border border-[#334155] bg-[#0f172a]/60
          px-4 py-3 text-sm text-white placeholder-[#475569]
          outline-none transition-all duration-200
          focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20
          hover:border-[#475569]
        "
            />
        </div>
    );
};

export default PasswordInput;
