import React, { useState } from 'react';
import {
    LayoutGrid,
    ChevronRight,
    ChevronDown,
    Package,
    Zap,
    User,
    Calendar as CalendarIcon
} from 'lucide-react';
import type { RedmineProject } from '../types';

interface Props {
    projects: RedmineProject[];
    selectedIds: number[];
    onSelect: (ids: number[]) => void;
}

export const Sidebar: React.FC<Props> = ({ projects, selectedIds, onSelect }) => {
    const findProject = (namePart: string) => {
        return projects.find(p => p.name.includes(namePart));
    };

    const productItems = [
        { label: "RVS 1.0", project: findProject("[표준본] RVS1.0") },
        { label: "RVS 1.5", project: findProject("[2024]RVS1.5-Solution") },
        { label: "RVS 2.0", project: findProject("[2025] RVS2.0 - 표준본") },
    ];

    return (
        <div className="w-64 bg-[#1a1c23] text-gray-400 flex flex-col h-full border-r border-gray-800 flex-shrink-0 font-sans shadow-2xl">
            {/* 1. Dashboard */}
            <div className="p-4 flex items-center gap-3 text-white font-bold text-lg border-b border-gray-800/50 mb-2">
                <LayoutGrid className="text-blue-500" size={20} />
                <span>Dashboard</span>
            </div>

            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar flex flex-col gap-1">
                {/* 2. Product Menu */}
                <MenuSection
                    icon={<Package size={18} />}
                    label="Product"
                    items={productItems}
                    selectedIds={selectedIds}
                    onSelect={onSelect}
                />

                {/* 3. Sprint (Placeholder) */}
                <div className="px-4 py-2 flex items-center gap-3 hover:bg-gray-800/50 cursor-pointer transition-colors group">
                    <Zap size={18} className="group-hover:text-amber-400 transition-colors" />
                    <span className="text-sm font-medium">Sprint</span>
                </div>

                {/* 5. PIC (Placeholder) */}
                <div className="px-4 py-2 flex items-center gap-3 hover:bg-gray-800/50 cursor-pointer transition-colors group">
                    <User size={18} className="group-hover:text-indigo-400 transition-colors" />
                    <span className="text-sm font-medium">PIC</span>
                </div>

                {/* 6. Calendar (Placeholder) */}
                <div className="px-4 py-2 flex items-center gap-3 hover:bg-gray-800/50 cursor-pointer transition-colors group">
                    <CalendarIcon size={18} className="group-hover:text-rose-400 transition-colors" />
                    <span className="text-sm font-medium">Calendar</span>
                </div>
            </div>

            <div className="p-4 border-t border-gray-800/50 text-[10px] text-center text-gray-600 uppercase tracking-widest bg-black/10">
                Redmine Client Dashboard
            </div>
        </div>
    );
};

interface MenuSectionProps {
    icon: React.ReactNode;
    label: string;
    items: { label: string; project?: RedmineProject }[];
    selectedIds: number[];
    onSelect: (ids: number[]) => void;
    defaultOpen?: boolean;
}

const MenuSection: React.FC<MenuSectionProps> = ({ icon, label, items, selectedIds, onSelect, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-1">
            <div
                className="px-4 py-2 flex items-center justify-between hover:bg-gray-800/50 cursor-pointer transition-colors group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 group-hover:text-blue-400 transition-colors">{icon}</span>
                    <span className="text-sm font-semibold text-gray-200">{label}</span>
                </div>
                <span className="text-gray-600">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
            </div>

            {isOpen && (
                <div className="mt-1 flex flex-col">
                    {items.map((item, idx) => {
                        const isSelected = item.project && selectedIds.includes(item.project.id);
                        return (
                            <div
                                key={idx}
                                className={`
                                    pl-11 pr-4 py-1.5 text-[13px] cursor-pointer transition-all border-l-2
                                    ${isSelected
                                        ? 'bg-blue-600/10 text-blue-400 border-blue-500 font-medium'
                                        : 'text-gray-500 border-transparent hover:text-gray-200 hover:bg-gray-800/30'}
                                `}
                                onClick={() => item.project && onSelect([item.project.id])}
                            >
                                <span className="truncate">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
