export interface RedmineStatus {
    id: number;
    name: string;
}

export interface RedmineTracker {
    id: number;
    name: string;
}

export interface RedmineUser {
    id: number;
    name: string;
}

export interface RedminePriority {
    id: number;
    name: string;
}

export interface RedmineCategory {
    id: number;
    name: string;
}

export interface RedmineIssue {
    id: number;
    subject: string;
    description: string;
    start_date?: string;
    due_date?: string;
    done_ratio: number;
    status: RedmineStatus;
    tracker: RedmineTracker;
    priority: RedminePriority;
    author: RedmineUser;
    assigned_to?: RedmineUser;
    category?: RedmineCategory;
    parent?: { id: number; subject?: string };
    created_on: string;
    updated_on: string;
    estimated_hours?: number;
    spent_hours?: number;
}

export interface RedmineProject {
    id: number;
    name: string;
    identifier: string;
    parent?: { id: number; name: string };
}
