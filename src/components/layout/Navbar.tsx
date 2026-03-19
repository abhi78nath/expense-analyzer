import { UserButton, useAuth } from "@clerk/react";
import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStatementRecordsByUserId } from "../../utils/db";

const Navbar = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useAuth();
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const currentUserId = window.Clerk?.user?.id;
        if (isSignedIn && currentUserId) {
            getStatementRecordsByUserId(currentUserId)
                .then(records => setHasData(records.length > 0))
                .catch(console.error);
        } else {
            setHasData(false);
        }
    }, [isSignedIn]);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-700/60"
            style={{
                background: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
        >
            {/* Left: Logo & App Name */}
            <div
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate("/")}
            >
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-emerald-500/10"
                    style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
                >
                    <BarChart3 className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
                </div>
                <span
                    className="text-lg font-bold tracking-tight bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, #10b981, #14b8a6, #22d3ee)" }}
                >
                    Expense Analyzer
                </span>
            </div>

            {/* Right: Auth Controls */}
            <div className="flex items-center gap-3">
                {isSignedIn ? (
                    <>
                        {hasData && (
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                                Dashboard
                            </button>
                        )}
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "h-9 w-9 border border-slate-700/60",
                                },
                            }}
                        />
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate("/signup")}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                            style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
                        >
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
