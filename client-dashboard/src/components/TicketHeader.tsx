import React from 'react';

interface Props {
    showPic?: boolean;
    showDeadline?: boolean;
    showPeriod?: boolean;
}

export const TicketHeader = React.memo(({ showPic, showDeadline, showPeriod }: Props) => {
    return (
        <div className="sticky top-0 z-40 bg-white">
            {/* Row 1: Aligns with Month Header (33px) */}
            <div className="h-[33px] bg-gray-50/50 flex items-center px-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket Information</span>
            </div>

            {/* Row 2: Aligns with Day Header (40px) */}
            <div className="h-[40px] flex items-center text-[9px] font-bold text-gray-500 uppercase tracking-tight pr-4">
                {/* Part & Sub (96px) */}
                {/* Part & Sub (96px) */}
                <div className="w-[48px] flex-shrink-0 flex flex-col items-start leading-tight pl-4">
                    <span>Part</span>
                    <span className="text-gray-400 font-medium normal-case">상위</span>
                </div>
                <div className="w-[48px] flex-shrink-0 flex flex-col items-start leading-tight">
                    <span>sub</span>
                    <span className="text-gray-400 font-medium normal-case">하위</span>
                </div>

                {/* Status Column (100px) */}
                <div className="w-[100px] flex-shrink-0 flex flex-col items-start leading-tight">
                    <span>Status</span>
                    <span className="text-gray-400 font-medium normal-case">상태</span>
                </div>

                {/* Title Column (flex-1) */}
                <div className="flex-1 min-w-0 pr-4 flex flex-col leading-tight">
                    <span>Title</span>
                    <span className="text-gray-400 font-medium normal-case">제목</span>
                </div>

                {/* Dynamic Filter Columns */}
                {/* 1. PIC / 담당자 */}
                {showPic && (
                    <div className="w-[70px] flex-shrink-0 flex flex-col items-start pl-2 leading-tight">
                        <span>PIC</span>
                        <span className="text-gray-400 font-medium normal-case">담당자</span>
                    </div>
                )}

                {/* 2. Deadline / 기한 */}
                {showDeadline && (
                    <div className="w-[80px] flex-shrink-0 flex flex-col items-start pl-2 leading-tight">
                        <span>Deadline</span>
                        <span className="text-gray-400 font-medium normal-case">기한</span>
                    </div>
                )}

                {/* 3. Period / 기간 */}
                {showPeriod && (
                    <div className="w-[140px] flex-shrink-0 flex flex-col items-start pl-2 leading-tight">
                        <span>Period</span>
                        <span className="text-gray-400 font-medium normal-case">기간</span>
                    </div>
                )}

                {/* Redmine Column (32px) - Centered */}
                <div
                    className="w-8 flex-shrink-0 flex flex-col items-center justify-center leading-tight cursor-help"
                    title="link to Redmine"
                >
                    <span>#</span>
                    <span className="text-gray-400 font-medium normal-case">일감</span>
                </div>

                {/* Estimate/Spent Column (160px) - Progress Bar Column */}
                <div className="w-40 flex-shrink-0 pl-1 pr-2 flex flex-col leading-tight border-l border-gray-100">
                    <span>Est/Spent</span>
                    <span className="text-gray-400 font-medium normal-case">추정/요소시간</span>
                </div>

                {/* % Column (56px) - Centered */}
                <div className="w-14 flex-shrink-0 flex flex-col items-center justify-center leading-tight">
                    <span>%</span>
                    <span className="text-gray-400 font-medium normal-case">진도율</span>
                </div>
            </div>
        </div>
    );
});
