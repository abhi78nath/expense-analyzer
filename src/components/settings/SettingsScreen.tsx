import { useState, useEffect } from 'react';
import { getTransactionTags } from '../../utils/api';
import { Tag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SidebarProvider } from '../dashboard/SidebarContext';
import DashboardLayout from '../dashboard/DashboardLayout';
import TagsSection from './TagsSection';
import { AddTagDrawer } from './AddTagDrawer';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { deleteMerchantRule } from '../../utils/api';
import type { MerchantRule } from '@/shared/types/merchant';
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SettingsScreenProps {
    onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
    const [activeTab, setActiveTab] = useState<'tags' | 'profile'>('tags');
    const [rules, setRules] = useState<MerchantRule[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingRule, setEditingRule] = useState<MerchantRule | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);
    const { toast } = useToast();

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

    const handleAddRule = (newRule: MerchantRule) => {
        setRules(prev => prev ? [newRule, ...prev] : [newRule]);
        toast({
            title: "Success",
            description: "Categorization rule added successfully",
            variant: "success",
        });
    };

    const handleUpdateRule = (updatedRule: MerchantRule) => {
        setRules(prev => prev ? prev.map(r => r.id === updatedRule.id ? updatedRule : r) : null);
        toast({
            title: "Success",
            description: "Categorization rule updated successfully",
            variant: "success",
        });
    };

    const handleDeleteRule = async () => {
        if (!ruleToDelete) return;

        try {
            await deleteMerchantRule(ruleToDelete);
            setRules(prev => prev ? prev.filter(r => r.id !== ruleToDelete) : null);
            toast({
                title: "Deleted",
                description: "Categorization rule deleted successfully",
                variant: "success",
            });
        } catch (err: any) {
            console.error("Failed to delete rule", err);
            toast({
                title: "Error",
                description: "Failed to delete rule: " + err.message,
                variant: "destructive",
            });
        } finally {
            setRuleToDelete(null);
        }
    };

    const handleEditInitiate = (rule: MerchantRule) => {
        setEditingRule(rule);
        setIsDrawerOpen(true);
    };

    const handleDrawerOpenChange = (open: boolean) => {
        setIsDrawerOpen(open);
        if (!open) setEditingRule(null);
    };

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

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your application preferences and categorization rules.</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onBack}
                                className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 gap-2 font-semibold"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Button>
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
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-800/20 flex items-center justify-between gap-4">
                                <div>
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
                                    <AddTagDrawer
                                        rules={rules}
                                        onAdd={handleAddRule}
                                        onUpdate={handleUpdateRule}
                                        initialData={editingRule}
                                        open={isDrawerOpen}
                                        onOpenChange={handleDrawerOpenChange}
                                    />
                                )}
                            </div>

                            {activeTab === 'tags' && (
                                <TagsSection
                                    rules={rules}
                                    loading={loading}
                                    error={error}
                                    onEdit={handleEditInitiate}
                                    onDelete={(id) => setRuleToDelete(id)}
                                />
                            )}

                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Manage your categorization rules here. Changes will be reflected in future statements.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
            <AlertDialog open={ruleToDelete !== null} onOpenChange={(open) => !open && setRuleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the categorization rule
                            for this merchant.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteRule}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            Delete Rule
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    );
};

export default SettingsScreen;
