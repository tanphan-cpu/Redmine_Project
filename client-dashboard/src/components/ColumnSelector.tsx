import React from 'react';
import { Check } from 'lucide-react';

interface FilterState {
    pic: boolean;
    deadline: boolean;
    period: boolean;
}

interface Props {
    filters: FilterState;
    onChange: (newFilters: FilterState) => void;
    small?: boolean;
}

export const ColumnSelector: React.FC<Props> = ({ filters, onChange, small }) => {
    const toggleFilter = (key: keyof FilterState) => {
        onChange({
            ...filters,
            [key]: !filters[key]
        });
    };

    const options = [
        { key: 'pic' as const, label: '담당자(PIC)' },
        { key: 'deadline' as const, label: '기한(Deadline)' },
        { key: 'period' as const, label: '기간(Period)' },
    ];

    return (
        <div className="flex items-center gap-3">
            {options.map((option) => {
                const isSelected = filters[option.key];
                return (
                    <div
                        key={option.key}
                        onClick={() => toggleFilter(option.key)}
                        className={`flex items-center cursor-pointer select-none group ${small ? 'gap-1' : 'gap-2'}`}
                    >
                        <div className={`rounded border flex items-center justify-center flex-shrink-0 transition-colors ${small ? 'w-3 h-3' : 'w-4 h-4'} ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                            {isSelected && <Check size={small ? 10 : 12} className="text-white" />}
                        </div>
                        <span className={`${small ? 'text-[10px] text-gray-400' : 'text-[13px] text-gray-700'} ${isSelected ? 'font-medium text-gray-600' : 'group-hover:text-gray-500'}`}>
                            {option.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
