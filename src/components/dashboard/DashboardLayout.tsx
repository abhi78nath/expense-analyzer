import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { isOpen, open } = useSidebar();

    return (
        <div className="relative min-h-screen">
            <Sidebar />

            {/* Main content area */}
            <main
                className={`
          min-h-screen transition-all duration-300 ease-out
          ${isOpen ? "lg:ml-60" : "lg:ml-0"}
        `}
            >
                {/* Mobile hamburger */}
                {!isOpen && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={open}
                        className="fixed top-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer lg:hidden"
                        style={{
                            background: "rgba(15, 23, 42, 0.8)",
                            backdropFilter: "blur(12px)",
                        }}
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}

                {/* Desktop hamburger (when sidebar collapsed) */}
                {!isOpen && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={open}
                        className="fixed top-5 left-5 z-30 hidden h-10 w-10 items-center justify-center rounded-xl border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer lg:flex"
                        style={{
                            background: "rgba(15, 23, 42, 0.8)",
                            backdropFilter: "blur(12px)",
                        }}
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}

                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
