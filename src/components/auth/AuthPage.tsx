import { SignIn, SignUp } from "@clerk/react";
import AnimatedBackground from "../upload/AnimatedBackground";
import Navbar from "../layout/Navbar";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthPageProps {
    mode: "sign-in" | "sign-up";
}

const AuthSkeleton = () => (
    <div className="flex flex-col gap-5 w-full">
        {/* Social button skeleton */}
        <Skeleton className="h-10 w-full rounded-xl bg-slate-700/30" />

        {/* Divider skeleton */}
        <div className="flex items-center justify-center my-2">
            <Skeleton className="h-px w-full bg-slate-700/30" />
            <Skeleton className="mx-4 h-3 w-6 rounded bg-slate-700/30" />
            <Skeleton className="h-px w-full bg-slate-700/30" />
        </div>

        {/* Inputs skeleton */}
        <div className="space-y-4">
            <div>
                <Skeleton className="h-3 w-24 rounded mb-2 bg-slate-700/30" />
                <Skeleton className="h-11 w-full rounded-xl bg-slate-700/30" />
            </div>
            <div>
                <Skeleton className="h-3 w-24 rounded mb-2 bg-slate-700/30" />
                <Skeleton className="h-11 w-full rounded-xl bg-slate-700/30" />
            </div>
        </div>

        {/* Primary button skeleton */}
        <Skeleton className="h-11 w-full rounded-xl mt-2 bg-emerald-600/20" />

        {/* Footer skeleton */}
        <Skeleton className="h-3 w-48 rounded mx-auto mt-4 bg-slate-700/30" />
    </div>
);

const AuthPage = ({ mode }: AuthPageProps) => {
    return (
        <div className="relative min-h-screen flex flex-col px-4 pt-24 pb-12 items-center justify-center">
            <AnimatedBackground />

            <div className="flex flex-col gap-6 w-full max-w-md">
                {/* Heading */}
                <div className="text-center">
                    <div
                        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-emerald-500/20 mb-4"
                        style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
                    >
                        <BarChart3 className="h-7 w-7 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        {mode === "sign-in" ? "Welcome back" : "Get started free"}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {mode === "sign-in"
                            ? "Sign in to your Expense Analyzer account"
                            : "Create your account to start analyzing expenses"}
                    </p>
                </div>

                {/* Glassmorphic Card wrapping Clerk form */}
                <div
                    className="w-full rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl shadow-black/20 min-h-[400px]"
                    style={{
                        background: "rgba(30, 41, 59, 0.50)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                    }}
                >
                    {mode === "sign-in" ? (
                        <SignIn
                            routing="path"
                            path="/login"
                            signUpUrl="/signup"
                            fallback={<AuthSkeleton />}
                        />
                    ) : (
                        <SignUp
                            routing="path"
                            path="/signup"
                            signInUrl="/login"
                            fallback={<AuthSkeleton />}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
