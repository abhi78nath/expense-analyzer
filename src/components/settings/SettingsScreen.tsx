import { useState, useEffect } from 'react';
import { getTransactionTags } from '../../utils/api';
import { Tag, ShieldCheck, ChevronRight } from 'lucide-react';
import { SidebarProvider } from '../dashboard/SidebarContext';
import DashboardLayout from '../dashboard/DashboardLayout';
import TagsSection from './TagsSection';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SettingsScreenProps {
    onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
    const [activeTab, setActiveTab] = useState<'tags' | 'profile'>('tags');
    const [rules, setRules] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const data = await getTransactionTags();
                setRules(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        fetchRules();
    }, []);

    return (
        <SidebarProvider>
            <DashboardLayout>
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex flex-col gap-3 px-1">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-slate-900 dark:text-white font-semibold">
                                        Settings
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-emerald-600 dark:text-emerald-400 font-bold">
                                        {activeTab === 'tags' ? 'Transaction Tags' : 'Profile'}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your application preferences and categorization rules.</p>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        {/* Browser-like Tabs Navigation */}
                        <div className="flex items-end gap-1 px-1 overflow-x-clip border-b border-slate-200 dark:border-slate-800">

                            <button
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60 rounded-t-xl border-transparent"
                                title="Coming Soon"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Profile</span>
                                <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase font-extrabold ml-1">Soon</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('tags')}
                                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-t-xl border-t border-l border-r
                  ${activeTab === 'tags'
                                        ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800 -mb-px z-10 font-bold"
                                        : "bg-transparent text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                                    }
                `}
                            >
                                <Tag className="w-4 h-4" />
                                <span>Transaction Tags</span>
                            </button>
                        </div>

                        {/* Main Content Area (Tab Content Wrapper) */}
                        <div className="bg-white dark:bg-slate-900 rounded-b-2xl rounded-tr-2xl shadow-xl border border-t-0 border-slate-200 dark:border-slate-800 overflow-hidden backdrop-blur-sm shadow-emerald-500/5">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-800/20">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {activeTab === 'tags' ? 'Categorization Rules' : 'Profile'}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    {activeTab === 'tags'
                                        ? 'Define how transactions should be tagged based on merchant names.'
                                        : 'Configure your application preferences and user experience settings.'
                                    }
                                </p>
                            </div>

                            {activeTab === 'tags' && (
                                <TagsSection rules={rules} loading={loading} error={error} />
                            )}

                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Editing these rules is currently read-only. Full customization coming soon.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </SidebarProvider>
    );
};

export default SettingsScreen;
