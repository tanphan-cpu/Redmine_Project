import axios from 'axios';
import type { RedmineIssue, RedmineProject } from '../types';

const API_KEY = import.meta.env.VITE_REDMINE_API_KEY;

// Use relative path to leverage Vite proxy
const apiClient = axios.create({
    baseURL: '/redmine-api',
    headers: {
        'X-Redmine-API-Key': API_KEY,
        'Content-Type': 'application/json',
    },
});

export const getProjects = async (): Promise<RedmineProject[]> => {
    const response = await apiClient.get<{ projects: RedmineProject[] }>('/projects.json', { params: { limit: 100 } });
    return response.data.projects;
};

export const getIssues = async (projectId?: number, limit = 100): Promise<RedmineIssue[]> => {
    // Calculate date 2 months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const updatedOnFilter = twoMonthsAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const params: any = {
        limit,
        updated_on: `>=${updatedOnFilter}` // Only fetch tickets updated in last 2 months
    };
    if (projectId) params.project_id = projectId;

    const response = await apiClient.get<{ issues: RedmineIssue[] }>('/issues.json', { params });
    return response.data.issues;
};

export const getIssueById = async (id: number): Promise<RedmineIssue> => {
    const response = await apiClient.get<{ issue: RedmineIssue }>(`/issues/${id}.json`);
    return response.data.issue;
};

