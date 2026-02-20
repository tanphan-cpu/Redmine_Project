import React from 'react';
import type { RedmineIssue } from '../types';
import { getPartLabel, getPartColor } from '../utils';
import { StatusBadge } from './StatusBadge';
import { GanttBar } from './GanttBar';
import { ExternalLink } from 'lucide-react';

interface Props {
    issue: RedmineIssue;
    isFeature?: boolean;
    isCompact?: boolean;
    maxHours?: number;
    showPic?: boolean;
    showDeadline?: boolean;
    showPeriod?: boolean;
    isHovered?: boolean;
    onHover?: (id: number | null) => void;
}

export const TicketRow = React.memo(({ issue, isFeature, isCompact, maxHours, showPic, showDeadline, showPeriod, isHovered, onHover }: Props) => {
    const partLabel = getPartLabel(issue);
    const redmineBaseUrl = 'https://projects.rsupport.com';
    const isDefect = issue.tracker.name.includes('결함');
    const isDone = issue.done_ratio === 100;

    // Helper for Period Logic
    const periodInfo = (() => {
        const start = issue.start_date;
        const due = issue.due_date;
        if (!start && !due) return { text: '~', align: 'justify-center' };
        if (!start) return { text: `~ ${due}`, align: 'justify-end pr-2' }; // No Start -> Right
        if (!due) return { text: `${start} ~`, align: 'justify-end pr-2' }; // No End -> Right
        return { text: `${start} ~ ${due}`, align: 'justify-end pr-2' };    // Both -> Right
    })();

    // 1. Compact mode (Sub-tickets): High density 24px
    if (isCompact) {
        return (
            <div
                className={`py-0 pl-12 pr-4 flex items-center h-[24px] box-border relative group/row transition-colors ${isHovered ? 'bg-blue-50/80' : (isDefect ? 'bg-red-50' : 'bg-gray-50/50')}`}
                onMouseEnter={() => onHover?.(issue.id)}
                onMouseLeave={() => onHover?.(null)}
            >
                <div className="flex-1 flex items-center h-full overflow-hidden">
                    {/* Part Column (Anchor for sub-tickets: 48px padding + 48px width = 96px) */}
                    <div className="w-[48px] flex-shrink-0 flex items-center justify-start">
                        {partLabel && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border border-transparent leading-none flex items-center justify-center shrink-0 ${getPartColor(partLabel)}`}>
                                {partLabel}
                            </span>
                        )}
                    </div>

                    {/* Status Column (Starts at 96px) */}
                    <div className="w-[100px] flex-shrink-0 flex items-center justify-start">
                        <StatusBadge status={issue.status.name} isDone={isDone} />
                    </div>
                </div>

                {/* Dynamic Columns: PIC -> Deadline -> Period */}
                {/* 1. PIC (70px) */}
                {showPic && (
                    <div className={`w-[70px] flex-shrink-0 flex items-center text-[10px] text-gray-600 truncate ${issue.assigned_to?.name ? 'justify-start pl-2' : 'justify-center'}`}>
                        {issue.assigned_to?.name || '-'}
                    </div>
                )}

                {/* 2. Deadline (80px) */}
                {showDeadline && (
                    <div className={`w-[80px] flex-shrink-0 flex items-center text-[10px] text-red-500 font-medium truncate ${issue.due_date ? 'justify-start pl-2' : 'justify-center'}`}>
                        {issue.due_date || '-'}
                    </div>
                )}

                {/* 3. Period (140px) */}
                {showPeriod && (
                    <div className={`w-[140px] flex-shrink-0 flex items-center ${periodInfo.align} text-[10px] text-gray-500 truncate`}>
                        {periodInfo.text}
                    </div>
                )}

                {/* Column 1: Redmine Link */}
                <div className="w-8 flex-shrink-0 flex justify-center items-center">
                    <a
                        href={`${redmineBaseUrl}/issues/${issue.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-blue-500 transition-colors"
                        title="link to Redmine"
                    >
                        <ExternalLink size={11} />
                    </a>
                </div>

                {/* Column 2: Bar (Left Aligned) */}
                <div className="w-40 flex-shrink-0 flex justify-start items-center pl-1 pr-2 border-l border-gray-100/50">
                    <GanttBar issue={issue} isCompact maxHours={maxHours} />
                </div>

                {/* Column 2: Percentage (Fixed Width, Centered) */}
                <div className={`w-14 flex-shrink-0 flex justify-center items-center font-bold tabular-nums ${isDone ? 'text-blue-500' : 'text-emerald-500'} text-[10px]`}>
                    {issue.done_ratio}%
                </div>
            </div>
        );
    }

    // 2. Main/Feature Row: Single-line streamlined layout
    return (
        <div
            onMouseEnter={() => onHover?.(issue.id)}
            onMouseLeave={() => onHover?.(null)}
            className={`
                px-4 py-0 flex items-center transition-colors h-[34px] box-border group/row
                ${isHovered ? 'bg-blue-50/80' : (isFeature ? 'bg-white' : 'bg-white pl-10')}
                ${isDefect && !isHovered ? '!bg-red-50/90' : ''}
            `}
        >
            {/* Single Line Content: [Part] [Status] [Subject] */}
            <div className="flex-1 flex items-center h-full overflow-hidden mr-4">
                {/* 1. Part Column (Anchor for main tickets: 16px padding + 80px width = 96px) */}
                <div className="w-[80px] flex-shrink-0 flex items-center justify-start">
                    {partLabel && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border border-transparent flex-shrink-0 leading-none flex items-center justify-center ${getPartColor(partLabel)}`}>
                            {partLabel}
                        </span>
                    )}
                </div>

                {/* 2. Status Column (Starts at 96px) */}
                <div className="w-[100px] flex-shrink-0 flex items-center justify-start">
                    <StatusBadge status={issue.status.name} isDone={isDone} />
                </div>

                {/* 3. Subject (Priority) */}
                <div className={`text-[12px] truncate min-w-0 ${isHovered ? 'font-black text-blue-900' : (isFeature ? 'font-bold text-gray-900' : 'text-gray-700 font-medium')}`}>
                    {issue.subject}
                </div>
            </div>

            {/* Dynamic Columns: PIC -> Deadline -> Period */}
            {/* 1. PIC (70px) */}
            {showPic && (
                <div className={`w-[70px] flex-shrink-0 flex items-center text-[10px] text-gray-600 truncate ${issue.assigned_to?.name ? 'justify-start pl-2' : 'justify-center'}`}>
                    {issue.assigned_to?.name || '-'}
                </div>
            )}

            {/* 2. Deadline (80px) */}
            {showDeadline && (
                <div className={`w-[80px] flex-shrink-0 flex items-center text-[10px] text-red-500 font-medium truncate ${issue.due_date ? 'justify-start pl-2' : 'justify-center'}`}>
                    {issue.due_date || '-'}
                </div>
            )}

            {/* 3. Period (140px) */}
            {showPeriod && (
                <div className={`w-[140px] flex-shrink-0 flex items-center ${periodInfo.align} text-[10px] text-gray-500 truncate`}>
                    {periodInfo.text}
                </div>
            )}

            {/* Column 1: Redmine Link */}
            <div className="w-8 flex-shrink-0 flex justify-center items-center">
                <a
                    href={`${redmineBaseUrl}/issues/${issue.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-gray-300 hover:text-blue-500 transition-colors"
                >
                    <ExternalLink size={11} />
                </a>
            </div>

            {/* Column 2: Bar (Left Aligned) */}
            <div className="w-40 flex-shrink-0 flex justify-start items-center pl-1 pr-2 border-l border-gray-100/50">
                <GanttBar issue={issue} maxHours={maxHours} />
            </div>

            {/* Column 3: Percentage (Fixed Width, Centered) */}
            <div className={`w-14 flex-shrink-0 flex justify-center items-center font-bold tabular-nums ${isDone ? 'text-blue-500' : 'text-emerald-500'} text-[10px]`}>
                {issue.done_ratio}%
            </div>
        </div>
    );
});
