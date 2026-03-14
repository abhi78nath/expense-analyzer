"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MerchantRule {
    merchant: string;
    category: string;
    tag: string;
}

interface AddTagDrawerProps {
    rules: MerchantRule[] | null;
    onAdd: (rule: MerchantRule) => void;
}

export function AddTagDrawer({ rules, onAdd }: AddTagDrawerProps) {
    const [open, setOpen] = React.useState(false)
    const [merchant, setMerchant] = React.useState("")
    const [category, setCategory] = React.useState("")
    const [tag, setTag] = React.useState("")

    const [categoryOpen, setCategoryOpen] = React.useState(false)
    const [tagOpen, setTagOpen] = React.useState(false)

    // Extract unique categories and tags from existing rules
    const categories = React.useMemo(() => {
        if (!rules) return []
        return Array.from(new Set(rules.map((r) => r.category))).sort()
    }, [rules])

    const tags = React.useMemo(() => {
        if (!rules) return []
        return Array.from(new Set(rules.map((r) => r.tag))).sort()
    }, [rules])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!merchant || !category || !tag) return

        onAdd({ merchant, category, tag })

        // Reset form
        setMerchant("")
        setCategory("")
        setTag("")
        setOpen(false)
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 shadow-lg gap-2">
                    <Plus className="w-4 h-4" />
                    Add Tag
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full">
                <div className="flex flex-col h-full">
                    <DrawerHeader className="border-b border-slate-100 dark:border-slate-800 pb-6">
                        <DrawerTitle className="text-xl font-bold">Add Categorization Rule</DrawerTitle>
                        <DrawerDescription>Create a new rule to automatically tag transactions from a specific merchant.</DrawerDescription>
                    </DrawerHeader>
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="merchant" className="text-sm font-semibold">Merchant Name</Label>
                            <Input
                                id="merchant"
                                placeholder="e.g. Swiggy, Netflix..."
                                value={merchant}
                                onChange={(e) => setMerchant(e.target.value)}
                                className="rounded-xl border-slate-200 dark:border-slate-800 h-11"
                                required
                            />
                        </div>

                        <div className="space-y-3 flex flex-col">
                            <Label className="text-sm font-semibold">Category</Label>
                            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={categoryOpen}
                                        className="justify-between rounded-xl border-slate-200 dark:border-slate-800 text-left font-normal h-11"
                                    >
                                        {category ? category : "Select category..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-900" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search category..." />
                                        <CommandList>
                                            <CommandEmpty>No category found.</CommandEmpty>
                                            <CommandGroup>
                                                {categories.map((c) => (
                                                    <CommandItem
                                                        key={c}
                                                        value={c}
                                                        onSelect={(currentValue) => {
                                                            setCategory(currentValue === category ? "" : currentValue)
                                                            setCategoryOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                category === c ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {c}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-3 flex flex-col">
                            <Label className="text-sm font-semibold">Default Tag</Label>
                            <Popover open={tagOpen} onOpenChange={setTagOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={tagOpen}
                                        className="justify-between rounded-xl border-slate-200 dark:border-slate-800 text-left font-normal h-11"
                                    >
                                        {tag ? tag : "Select tag..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-900" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search tag..." />
                                        <CommandList>
                                            <CommandEmpty>No tag found.</CommandEmpty>
                                            <CommandGroup>
                                                {tags.map((t) => (
                                                    <CommandItem
                                                        key={t}
                                                        value={t}
                                                        onSelect={(currentValue) => {
                                                            setTag(currentValue === tag ? "" : currentValue)
                                                            setTagOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                tag === t ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {t}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </form>
                    <DrawerFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10">
                        <Button type="submit" onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 shadow-lg shadow-emerald-500/20 cursor-pointer">
                            Save Rule
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline" className="rounded-xl h-12 cursor-pointer">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer >
    )
}
