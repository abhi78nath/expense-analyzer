import {
    BarChart3,
    LayoutDashboard,
    TrendingUp,
    Wallet,
    Settings,
    HelpCircle,
    X,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { Button } from "@/components/ui/button";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    { label: "Analytics", icon: TrendingUp, disabled: true },
    { label: "Budgets", icon: Wallet, disabled: true },
];

const bottomItems = [
    { label: "Settings", icon: Settings },
    { label: "Help", icon: HelpCircle },
];

const Sidebar = () => {
    const { isOpen, close } = useSidebar();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={close}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`
          fixed top-0 left-0 z-50 flex h-full w-60 flex-col border-r border-slate-800
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
                style={{
                    background: "rgba(15, 23, 42, 0.92)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                }}
            >
                {/* Top — Logo */}
                <div className="flex items-center justify-between px-5 py-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-full shadow-md shadow-emerald-500/20"
                            style={{
                                background: "linear-gradient(135deg, #10b981, #14b8a6)",
                            }}
                        >
                            <BarChart3 className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-base font-bold tracking-tight text-white">
                            FinanceFlow
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={close}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1 px-3 pt-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.label}
                            variant="ghost"
                            disabled={item.disabled}
                            className={`
                flex w-full justify-start items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                transition-all duration-200 cursor-pointer h-auto
                ${item.active
                                    ? "bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/5 hover:bg-emerald-500/20 hover:text-emerald-400"
                                    : item.disabled
                                        ? "text-slate-600 cursor-not-allowed opacity-50"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }
              `}
                        >
                            <item.icon className="h-4.5 w-4.5" />
                            {item.label}
                            {item.disabled && (
                                <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600">
                                    Soon
                                </span>
                            )}
                        </Button>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="space-y-1 border-t border-slate-800 px-3 py-4">
                    {bottomItems.map((item) => (
                        <Button
                            key={item.label}
                            variant="ghost"
                            className="flex w-full justify-start items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer h-auto"
                        >
                            <item.icon className="h-4.5 w-4.5" />
                            {item.label}
                        </Button>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
