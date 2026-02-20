import type { RedmineIssue } from "./types";
import { type LucideIcon, PenTool, Code, CircuitBoard, CheckCircle, FileText } from "lucide-react";

// Status Colors (Sophisticated mapping as per user request)
// Status Colors (Sophisticated mapping as per user request)
export const getStatusColor = (statusName: string, _isDone: boolean = false): string => {
    const s = statusName.toLowerCase();

    if (s.includes("신규") || s.includes("new"))
        return "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]"; // Light Green New
    if (s.includes("진행") || s.includes("doing"))
        return "bg-[#A7F3D0] text-[#1E40AF] border-[#6EE7B7]"; // Darker Green BG + Blue Text
    if (s.includes("해결") || s.includes("complete") || s.includes("resolved"))
        return "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]"; // Unified Blue
    if (s.includes("완료성공") || s.includes("success"))
        return "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]"; // Emerald
    if (s.includes("보류") || s.includes("pause") || s.includes("hold"))
        return "bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]"; // Gray
    if (s.includes("완료실패") || s.includes("fail"))
        return "bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]"; // Pastel Pink
    if (s.includes("피드백") || s.includes("feedback"))
        return "bg-[#FFFF00] text-[#000000] border-[#E6E600]"; // Yellow (Image 2 style)

    return "bg-gray-50 text-gray-500 border-gray-100";
};

export const getStatusBarColor = (statusName: string, _isDone: boolean = false): string => {
    const s = statusName.toLowerCase();

    if (s.includes("신규") || s.includes("new")) return "bg-[#86EFAC]"; // Light Green Bar
    if (s.includes("진행") || s.includes("doing")) return "bg-[#10B981]"; // Back to Dark Emerald
    if (s.includes("해결") || s.includes("complete") || s.includes("resolved")) return "bg-[#3B82F6]";
    if (s.includes("완료성공") || s.includes("success")) return "bg-[#059669]";
    if (s.includes("완료실패") || s.includes("fail")) return "bg-[#F472B6]";
    if (s.includes("피드백") || s.includes("feedback")) return "bg-[#FFFF00]";
    if (s.includes("보류") || s.includes("pause")) return "bg-[#9CA3AF]";

    return "bg-[#3B82F6]";
};

// Part Icons based on Category or Subject
export const getPartIcon = (issue: RedmineIssue): LucideIcon => {
    const cat = issue.category?.name || "";
    const tracker = issue.tracker?.name || "";
    const subject = issue.subject || "";

    if (cat.includes("기획") || cat.includes("Planning") || tracker.includes("기획")) return FileText;
    if (cat.includes("디자인") || cat.includes("Design") || tracker.includes("디자인")) return PenTool;
    if (cat.includes("Front") || cat.includes("FE") || subject.includes("FE")) return Code;
    if (cat.includes("Back") || cat.includes("BE") || subject.includes("BE")) return CircuitBoard;
    if (cat.includes("QA") || cat.includes("Test") || tracker.includes("QA")) return CheckCircle;

    return FileText; // Default
};

const FE_MEMBERS = [
    "FE_CVThanh", "FE_DVHuy", "FE_PTVang", "FE_TDAnh", "FE_VAnh (Henry)",
    "전현지", "여찬규", "김정범", "신희진", "이예나(Nancy)"
];

const BE_MEMBERS = [
    "이자련(ryeon)", "이경환 (Riss)", "염종환(Lucas)", "선혁(Ronnie)",
    "배준(JUN)", "민광철(Richie)", "김상희(sony)"
];

const PLAN_DESIGN_MEMBERS = [
    "박재경(Jen)", "라경연"
];

export const getPartLabel = (issue: RedmineIssue): string => {
    const assignee = issue.assigned_to?.name || "";
    const cat = issue.category?.name || "";
    const subject = issue.subject || "";

    // 1. Check Assignee
    if (FE_MEMBERS.some(m => assignee.includes(m))) return "FE";
    if (BE_MEMBERS.some(m => assignee.includes(m))) return "BE";
    if (PLAN_DESIGN_MEMBERS.some(m => assignee.includes(m))) {
        if (cat.includes("디자인") || subject.includes("Design")) return "Design";
        return "Plan";
    }

    // 2. Check Category
    if (cat.toLowerCase().includes("front") || cat.includes("FE")) return "FE";
    if (cat.toLowerCase().includes("back") || cat.includes("BE")) return "BE";
    if (cat.toLowerCase().includes("design") || cat.includes("디자인")) return "Design";
    if (cat.toLowerCase().includes("plan") || cat.includes("기획")) return "Plan";
    if (cat.toLowerCase().includes("qa") || cat.includes("검증")) return "QA";
    if (cat.toLowerCase().includes("pm") || cat.includes("관리")) return "PM";

    // 3. Fallback to Tracker (Strict PM identification only)
    const tracker = issue.tracker?.name || "";
    if (tracker.toLowerCase().includes("pm")) return "PM";

    // 4. Return empty if no specific part matched
    return "";
};

export const getPartColor = (label: string): string => {
    switch (label) {
        case "FE": return "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]";
        case "BE": return "bg-[#F0F9FF] text-[#0369A1] border-[#E0F2FE]";
        case "Plan": return "bg-[#46BDC6] text-[#FFFF00] border-[#3AA9B2]";
        case "Design": return "bg-[#351C75] text-[#FFFFFF] border-[#201146]";
        case "QA": return "bg-[#FEF2F2] text-[#B91C1C] border-[#FEE2E2]";
        default: return "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]";
    }
};

export interface GroupedTicket {
    feature: RedmineIssue;
    parts: RedmineIssue[];
}

// Heuristic to decide if a standalone ticket is a "Feature"
export const isFeature = (i: RedmineIssue) => {
    return !i.parent;
}

// Grouping Logic
export const groupTickets = (issues: RedmineIssue[]): GroupedTicket[] => {
    const groups: Record<number, GroupedTicket> = {};
    const issueMap = new Map<number, RedmineIssue>(issues.map(i => [i.id, i]));

    issues.forEach(issue => {
        if (!issue.parent) {
            if (!groups[issue.id]) {
                groups[issue.id] = { feature: issue, parts: [] };
            }
        }
        else {
            const parentId = issue.parent.id;
            if (!groups[parentId]) {
                const parent = issueMap.get(parentId);
                if (parent) {
                    groups[parentId] = { feature: parent, parts: [] };
                }
            }
            if (groups[parentId]) {
                const label = getPartLabel(issue);
                if (label !== "PM") {
                    groups[parentId].parts.push(issue);
                }
            }
        }
    });

    return Object.values(groups)
        .filter(g => g.parts.length > 0 || isFeature(g.feature))
        .sort((a, b) => {
            // Priority 1: Created Date (Recent first)
            const dateA = new Date(a.feature.created_on).getTime();
            const dateB = new Date(b.feature.created_on).getTime();
            if (dateB !== dateA) return dateB - dateA;

            // Priority 2: Due Date (Recent first)
            const dueA = a.feature.due_date ? new Date(a.feature.due_date).getTime() : 0;
            const dueB = b.feature.due_date ? new Date(b.feature.due_date).getTime() : 0;
            return dueB - dueA;
        });
};
