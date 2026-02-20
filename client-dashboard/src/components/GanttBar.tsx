import React from 'react';
import type { RedmineIssue } from '../types';
import { getStatusBarColor } from '../utils';

interface Props {
    issue: RedmineIssue;
    isCompact?: boolean;
    maxHours?: number;
}

export const GanttBar: React.FC<Props> = ({ issue, maxHours = 24 }) => {
    const est = issue.estimated_hours || 0;
    const spent = issue.spent_hours || 0;
    const progress = issue.done_ratio || 0;
    const isDone = progress === 100;

    // The length of the bar container is based on the max of est or spent
    const itemMax = Math.max(est, spent);
    if (itemMax <= 0) return null;

    // Use maxHours (project-wide max) for relative scaling
    const scaleReference = Math.max(maxHours, itemMax, 1);

    // User request: "độ dài tối thiểu = độ dài hiện tại của 0.5h"
    // Previously, minWidth was based on 6h relative to project scale.
    // We'll keep that visual weight (6h/Scale) as the floor for a 0.5h task.
    const floorWidth = Math.min((6 / scaleReference) * 100, 30); // Clamp floor to reasonable 30% max

    let containerWidth: number;
    if (itemMax <= 0.5) {
        containerWidth = floorWidth;
    } else if (itemMax >= 14) {
        containerWidth = 100; // Cap at 14h
    } else {
        // Linear interpolation between 0.5h (floorWidth) and 14h (100%)
        const ratio = (itemMax - 0.5) / (14 - 0.5);
        containerWidth = floorWidth + (ratio * (100 - floorWidth));
    }

    // Widths within the container
    const estPercent = (est / itemMax) * 100;
    const spentPercent = (spent / itemMax) * 100;

    // Colors: Centralized status-based colors
    const spentBg = getStatusBarColor(issue.status.name, isDone);
    const estBg = isDone ? 'bg-blue-100/30' : 'bg-gray-100/50';

    // User request: Add border if Estimate > Spent
    const hasBuffer = est > spent;
    const bufferBorder = isDone
        ? 'border-blue-400/50'
        : (issue.status.name === '진행(Doing)' ? 'border-emerald-400/60' : 'border-teal-400/50');

    return (
        <div className="flex items-center justify-start w-full">
            {/* Bar Container - Scaled relative to project-wide max hours */}
            <div
                className={`relative bg-gray-50 border rounded-full overflow-hidden transition-all duration-500 h-[15px] ${hasBuffer ? bufferBorder : 'border-gray-200/40'}`}
                style={{ width: `${containerWidth}%` }}
            >
                {/* Layer 1: Estimated Hours (Lighter) */}
                <div
                    className={`absolute inset-y-0 left-0 ${estBg} z-10 transition-all duration-700 ease-out border-r border-gray-200/20`}
                    style={{ width: `${estPercent}%` }}
                >
                    {est > 0 && estPercent > 15 && (
                        <span className="absolute left-1.5 inset-y-0 flex items-center font-bold text-gray-400/80 pointer-events-none select-none whitespace-nowrap text-[8px]">
                            {parseFloat(est.toFixed(1))}h
                        </span>
                    )}
                </div>

                {/* Layer 2: Spent Hours (Solid Color - Overlapping) */}
                <div
                    className={`absolute inset-y-0 left-0 ${spentBg} z-20 transition-all duration-700 ease-out flex items-center shadow-[1px_0_3px_rgba(0,0,0,0.1)] rounded-full`}
                    style={{ width: `${spentPercent}%` }}
                >
                    {spent > 0 && spentPercent > 15 && (
                        <span className={`absolute left-1.5 inset-y-0 flex items-center font-bold pointer-events-none select-none whitespace-nowrap text-[8px] ${issue.status.name.toLowerCase().includes('feedback') || issue.status.name.includes('피드백') ? 'text-black' : 'text-white'}`}>
                            {parseFloat(spent.toFixed(1))}h
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
