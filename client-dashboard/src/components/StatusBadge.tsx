import React from 'react';
import { getStatusColor } from '../utils';

interface Props {
    status: string;
    isDone?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, isDone }) => {
    const colorClass = getStatusColor(status, isDone);
    return (
        <span className={`px-2 py-0.5 text-[9px] leading-none rounded-full font-bold tracking-tight ${colorClass} border border-transparent inline-flex items-center justify-center shrink-0`}>
            {status}
        </span>
    );
};
