import React, { useEffect, useRef } from 'react';
import type { RedmineIssue } from '../types';
import type { GroupedTicket } from '../utils';
import {
    eachDayOfInterval,
    format,
    isSameDay,
    addMonths,
    startOfMonth,
    endOfMonth,
    parseISO,
    isValid,
    eachMonthOfInterval,
    isSameMonth
} from 'date-fns';
import { getStatusBarColor } from '../utils';

interface Props {
    groupedTickets: GroupedTicket[];
    containerRef?: React.RefObject<HTMLDivElement | null>;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    showHeaders?: boolean;
    showRows?: boolean;
    hoveredTicketId?: number | null;
    onHover?: (id: number | null) => void;
}

export const GanttGrid = React.memo(({ groupedTickets, containerRef, onScroll, showHeaders = true, showRows = true, hoveredTicketId, onHover }: Props) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = containerRef || internalRef;

    // 1. Determine date range: Current Month +/- 6 Months
    const today = new Date();
    const startDate = startOfMonth(addMonths(today, -6));
    const endDate = endOfMonth(addMonths(today, 6));

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    // 2. Scroll to current day on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            const todayCell = scrollContainerRef.current.querySelector('[data-today="true"]');
            if (todayCell) {
                const containerWidth = scrollContainerRef.current.offsetWidth;
                const cellOffset = (todayCell as HTMLElement).offsetLeft;
                // Center today
                scrollContainerRef.current.scrollLeft = cellOffset - (containerWidth / 2) + 16;
            }
        }
    }, [groupedTickets]); // Run when data loads

    return (
        <div
            ref={scrollContainerRef}
            onScroll={onScroll}
            className={`w-full ${showHeaders && !showRows ? 'overflow-hidden' : 'overflow-auto'} bg-white custom-scrollbar selection:bg-transparent h-full`}
        >
            <div className="min-w-max relative flex flex-col">
                {showHeaders && (
                    <>
                        {/* Header Row 1: Months / Years - Sticky */}
                        <div className="flex sticky top-0 bg-white z-20 border-b border-gray-200 h-[33px]">
                            {months.map(month => {
                                const daysInMonth = eachDayOfInterval({
                                    start: startOfMonth(month) > startDate ? startOfMonth(month) : startDate,
                                    end: endOfMonth(month) < endDate ? endOfMonth(month) : endDate
                                });
                                return (
                                    <div
                                        key={month.toISOString()}
                                        className={`flex-shrink-0 py-1.5 px-2 text-[10px] font-bold flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm h-full ${isSameMonth(month, today) ? 'text-blue-600' : 'text-gray-500'}`}
                                        style={{ width: `${daysInMonth.length * 32}px` }}
                                    >
                                        <span className="uppercase tracking-widest">{format(month, 'MMM')} {format(month, 'yyyy')}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Header Row 2: Days - Sticky */}
                        <div className="flex sticky top-[33px] bg-white z-20 h-[40px]">
                            {days.map(day => (
                                <div
                                    key={day.toISOString()}
                                    data-today={isSameDay(day, today)}
                                    className={`flex-shrink-0 w-8 h-full flex flex-col items-center justify-center text-[10px] ${isSameDay(day, today) ? 'bg-blue-100/40' : ''}`}
                                >
                                    <span className={`font-bold ${isSameDay(day, today) ? 'text-blue-700 underline underline-offset-2' : 'text-gray-700'}`}>{format(day, 'd')}</span>
                                    <span className="text-gray-400 uppercase font-medium">{format(day, 'EEEEE')}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {showRows && (
                    /* Rows Area */
                    <div className="flex flex-col relative min-h-full">
                        {/* Today Line Indicator (Vertical) - Extends through full height */}
                        <div
                            className="absolute top-0 bottom-0 w-[2px] bg-blue-500/20 z-10 pointer-events-none"
                            style={{
                                left: `${days.findIndex(d => isSameDay(d, today)) * 32 + 15}px`,
                                height: '100%'
                            }}
                        />

                        {groupedTickets.map(group => (
                            <React.Fragment key={group.feature.id}>
                                <GanttRow
                                    issue={group.feature}
                                    days={days}
                                    isFeature
                                    isHovered={hoveredTicketId === group.feature.id}
                                    onHover={onHover}
                                />
                                {group.parts.map(part => (
                                    <GanttRow
                                        key={part.id}
                                        issue={part}
                                        days={days}
                                        isCompact
                                        isHovered={hoveredTicketId === part.id}
                                        onHover={onHover}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

const GanttRow = React.memo(({ issue, days, isFeature, isCompact, isHovered, onHover }: { issue: RedmineIssue, days: Date[], isFeature?: boolean, isCompact?: boolean, isHovered?: boolean, onHover?: (id: number | null) => void }) => {
    const start = issue.start_date ? parseISO(issue.start_date) : null;
    const end = issue.due_date ? parseISO(issue.due_date) : null;

    // Progress calculation based on Spent Hours / Estimated Hours (User request)
    const est = issue.estimated_hours || 0;
    const spent = issue.spent_hours || 0;
    // Done ratio as fallback if hours are missing
    const progress = est > 0 ? (spent / est) * 100 : issue.done_ratio;

    // Logic: If 100% done and spent < est (progress < 100), show spent time only (no gray background)
    const isCompletedUnderBudget = issue.done_ratio === 100 && progress < 100;
    const baseBarClass = isCompletedUnderBudget ? "bg-transparent" : "bg-gray-200/40";

    return (
        <div
            onMouseEnter={() => onHover?.(issue.id)}
            onMouseLeave={() => onHover?.(null)}
            className={`flex ${isCompact ? 'h-[24px]' : 'h-[34px]'} items-center box-border transition-colors group ${isHovered ? 'bg-blue-50/80 ring-1 ring-blue-200/50 z-10' : (isFeature ? 'bg-white' : 'bg-gray-50/20')}`}
        >
            {days.map((day) => {
                const dayParams = getBarParams(day, start, end, issue.status.name, progress);
                return (
                    <div
                        key={day.toISOString()}
                        className={`flex-shrink-0 w-8 h-full flex items-center justify-center relative ${isHovered ? 'bg-blue-50/10' : (isSameDay(day, new Date()) ? 'bg-blue-50/10' : 'group-hover:bg-gray-100/10')}`}
                    >
                        {dayParams && (
                            <div className={`absolute ${isCompact ? 'h-1.5' : 'h-3'} w-[calc(100%+1px)] ${baseBarClass} ${dayParams.rounded} overflow-hidden z-[5]`} title={`${issue.subject} (${issue.status.name})`}>
                                <div
                                    className={`h-full ${dayParams.color} ${dayParams.progressRounded} transition-all duration-500 relative`}
                                    style={{ width: `${dayParams.fill}%` }}
                                >
                                </div>
                                {/* Percentage Label at End of Bar */}
                                {dayParams.showLabel && (
                                    <span className="absolute left-[100%] ml-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-600 whitespace-nowrap z-20 pointer-events-none drop-shadow-sm px-0.5 bg-white/50 rounded-sm">
                                        {Math.round(progress)}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
});

function getBarParams(day: Date, start: Date | null, end: Date | null, status: string, progress: number): { color: string; rounded: string; fill: number; progressRounded: string; showLabel: boolean } | null {
    if (!start || !end || !isValid(start) || !isValid(end)) return null;

    const target = day.getTime();
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);

    if (target >= s && target <= e) {
        const bg = getStatusBarColor(status, progress >= 100);

        let rounded = "";
        if (isSameDay(day, start)) rounded += " rounded-l-full ml-1";
        if (isSameDay(day, end)) rounded += " rounded-r-full mr-1";

        // Calculate if this specific day is part of the progress
        // Total days:
        const totalDays = Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)) + 1);
        const dayIndex = Math.round((target - s) / (24 * 60 * 60 * 1000));

        // Progress spread across days
        let fill = 0;
        const progressInDays = (progress / 100) * totalDays;

        if (dayIndex < Math.floor(progressInDays)) {
            fill = 100;
        } else if (dayIndex === Math.floor(progressInDays)) {
            fill = (progressInDays % 1) * 100;
        }

        // EDGE CASE: If fill is 0 but it IS the visual end (e.g. exactly at day boundary), handle it?
        // Actually, if fill is 0, it won't render visibly.
        // If progressInDays is exactly 2.0. dayIndex=1 (2nd day) has fill=100. dayIndex+1=2. 2 >= 2.0.
        // checking dayIndex == Math.floor(progressInDays) handles the partial tip.
        // BUT if progressInDays is exactly integer, the "tip" is the previous full day.
        // Let's rely on finding standard visual tip.
        // A better check for "Tip": The day that contains the right-most colored pixel.
        // If fill > 0: it is potentially a tip.
        // If next day has fill=0 or is out of range, then THIS is the tip.

        // Simpler logic for label: Check if dayIndex corresponds to the LAST day that has fill.
        const lastFilledDayIndex = Math.floor(progressInDays - 0.001); // e.g. 2.0 -> 1, 2.5 -> 2
        const showLabel = dayIndex === lastFilledDayIndex && fill > 0;

        // Use simpler Logic for rounding for now to match previous robust step
        const progressRounded = (dayIndex === lastFilledDayIndex && fill > 0) ? "rounded-r-full" : "";

        return { color: bg, rounded, fill, progressRounded, showLabel };
    }
    return null;
}
