import {
    BarChart3,
    LayoutDashboard,
    TrendingUp,
    Wallet,
    Settings,
    HelpCircle,
    PanelLeft,
    PanelRight,
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
    const { isOpen, toggle, close } = useSidebar();
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
          fixed top-0 left-0 z-50 flex h-full flex-col border-r border-slate-800
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-20"}
          ${!isOpen && isMobile ? "-translate-x-full" : "translate-x-0"}
        `}
                style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                }}
            >
                {/* Top — Logo & Toggle */}
                <div className={`flex items-center px-4 py-6 ${isOpen ? "justify-between" : "justify-center"}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-md shadow-emerald-500/20"
                            style={{
                                background: "linear-gradient(135deg, #10b981, #14b8a6)",
                            }}
                        >
                            <BarChart3 className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        {isOpen && (
                            <span className="truncate text-base font-bold tracking-tight text-white whitespace-nowrap">
                                Expense Analyzer
                            </span>
                        )}
                    </div>
                    {isOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggle}
                            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        >
                            <PanelLeft className="h-4 w-4" />
                        </Button>
                    )}
                    {isMobile && isOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={close}
                            className="lg:hidden h-8 w-8 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-2 px-3 pt-2">
                    {!isOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggle}
                            className="mb-4 mx-auto hidden lg:flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        >
                            <PanelRight className="h-5 w-5" />
                        </Button>
                    )}

                    {navItems.map((item) => (
                        <Button
                            key={item.label}
                            variant="ghost"
                            disabled={item.disabled}
                            title={!isOpen ? item.label : undefined}
                            className={`
                flex items-center gap-3 rounded-xl px-0 py-2.5 text-sm font-medium
                transition-all duration-200 cursor-pointer h-auto w-full
                ${isOpen ? "justify-start px-3" : "justify-center"}
                ${item.active
                                    ? "bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/5 hover:bg-emerald-500/20 hover:text-emerald-400"
                                    : item.disabled
                                        ? "text-slate-600 cursor-not-allowed opacity-50"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }
              `}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {isOpen && (
                                <span className="truncate whitespace-nowrap">{item.label}</span>
                            )}
                            {isOpen && item.disabled && (
                                <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 uppercase font-bold">
                                    Soon
                                </span>
                            )}
                        </Button>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="space-y-2 border-t border-slate-800 px-3 py-4">
                    {bottomItems.map((item) => (
                        <Button
                            key={item.label}
                            variant="ghost"
                            title={!isOpen ? item.label : undefined}
                            className={`
                flex items-center gap-3 rounded-xl px-0 py-2.5 text-sm font-medium
                text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer h-auto w-full
                ${isOpen ? "justify-start px-3" : "justify-center"}
              `}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {isOpen && <span className="truncate whitespace-nowrap">{item.label}</span>}
                        </Button>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
