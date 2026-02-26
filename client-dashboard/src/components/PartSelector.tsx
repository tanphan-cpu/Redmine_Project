import React from 'react';
import { Check } from 'lucide-react';

export interface PartFilterState {
    be: boolean;
    fe: boolean;
    plan: boolean;
    design: boolean;
    qa: boolean;
}

interface Props {
    filters: PartFilterState;
    onChange: (newFilters: PartFilterState) => void;
    small?: boolean;
}

export const PartSelector: React.FC<Props> = ({ filters, onChange, small }) => {
    const toggleFilter = (key: keyof PartFilterState) => {
        onChange({
            ...filters,
            [key]: !filters[key]
        });
    };

    const options = [
        { key: 'be' as const, label: 'BE' },
        { key: 'fe' as const, label: 'FE' },
        { key: 'plan' as const, label: '기획' },
        { key: 'design' as const, label: '디자인' },
        { key: 'qa' as const, label: 'QA' },
    ];

    return (
        <div className="flex items-center gap-4">
            {options.map((option) => {
                const isSelected = filters[option.key];
                return (
                    <div
                        key={option.key}
                        onClick={() => toggleFilter(option.key)}
                        className={`flex items-center cursor-pointer select-none group ${small ? 'gap-1' : 'gap-2'}`}
                    >
                        <div className={`rounded border flex items-center justify-center flex-shrink-0 transition-colors ${small ? 'w-3 h-3' : 'w-4 h-4'} ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400'}`}>
                            {isSelected && <Check size={small ? 10 : 12} className="text-white" />}
                        </div>
                        <span className={`${small ? 'text-[11px] font-medium' : 'text-[13px]'} ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                            {option.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
