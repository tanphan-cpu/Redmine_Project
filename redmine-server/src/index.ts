#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const REDMINE_URL = process.env.REDMINE_URL;
const REDMINE_API_KEY = process.env.REDMINE_API_KEY;

if (!REDMINE_URL || !REDMINE_API_KEY) {
    throw new Error('REDMINE_URL and REDMINE_API_KEY environment variables are required');
}

interface RedmineIssue {
    id: number;
    subject: string;
    description: string;
    status: {
        id: number;
        name: string;
    };
    priority: {
        id: number;
        name: string;
    };
    author: {
        id: number;
        name: string;
    };
    assigned_to?: {
        id: number;
        name: string;
    };
    project: {
        id: number;
        name: string;
    };
    tracker: {
        id: number;
        name: string;
    };
    created_on: string;
    updated_on: string;
    due_date?: string;
    done_ratio: number;
    estimated_hours?: number;
    spent_hours?: number;
}

interface RedmineProject {
    id: number;
    name: string;
    identifier: string;
    description: string;
    status: number;
    created_on: string;
    updated_on: string;
}

const isValidIssuesArgs = (args: any): args is { project_id?: number; status_id?: number; assigned_to_id?: number; limit?: number } =>
    typeof args === 'object' &&
    args !== null &&
    (args.project_id === undefined || typeof args.project_id === 'number') &&
    (args.status_id === undefined || typeof args.status_id === 'number') &&
    (args.assigned_to_id === undefined || typeof args.assigned_to_id === 'number') &&
    (args.limit === undefined || typeof args.limit === 'number');

const isValidProjectArgs = (args: any): args is { project_id: number } =>
    typeof args === 'object' &&
    args !== null &&
    typeof args.project_id === 'number';

class RedmineServer {
    private server: Server;
    private axiosInstance;

    constructor() {
        this.server = new Server(
            {
                name: 'redmine-server',
                version: '0.1.0',
            },
            {
                capabilities: {
                    resources: {},
                    tools: {},
                },
            }
        );

        this.axiosInstance = axios.create({
            baseURL: `${REDMINE_URL}/`,
            headers: {
                'X-Redmine-API-Key': REDMINE_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        this.setupResourceHandlers();
        this.setupToolHandlers();

        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupResourceHandlers() {
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
            resources: [
                {
                    uri: 'redmine://projects',
                    name: 'All Redmine Projects',
                    mimeType: 'application/json',
                    description: 'List of all projects in Redmine',
                },
                {
                    uri: 'redmine://issues',
                    name: 'All Redmine Issues',
                    mimeType: 'application/json',
                    description: 'List of all issues in Redmine',
                },
            ],
        }));

        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;

            try {
                if (uri === 'redmine://projects') {
                    const response = await this.axiosInstance.get<{ projects: RedmineProject[] }>('projects.json');
                    return {
                        contents: [
                            {
                                uri: request.params.uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(response.data.projects, null, 2),
                            },
                        ],
                    };
                } else if (uri === 'redmine://issues') {
                    const response = await this.axiosInstance.get<{ issues: RedmineIssue[] }>('issues.json?limit=100&include=spent_hours');
                    return {
                        contents: [
                            {
                                uri: request.params.uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(response.data.issues, null, 2),
                            },
                        ],
                    };
                } else {
                    throw new McpError(ErrorCode.InvalidRequest, `Unknown resource URI: ${uri}`);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new McpError(
                        ErrorCode.InternalError,
                        `Redmine API error: ${error.response?.data?.message ?? error.message}`
                    );
                }
                throw error;
            }
        });
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_issues',
                    description: 'Get issues from Redmine with optional filters',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project_id: {
                                type: 'number',
                                description: 'Filter by project ID',
                            },
                            status_id: {
                                type: 'number',
                                description: 'Filter by status ID',
                            },
                            assigned_to_id: {
                                type: 'number',
                                description: 'Filter by assigned user ID',
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum number of issues to return (default: 25)',
                                minimum: 1,
                                maximum: 100,
                            },
                        },
                    },
                },
                {
                    name: 'get_projects',
                    description: 'Get all projects from Redmine',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_project_issues',
                    description: 'Get all issues for a specific project',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project_id: {
                                type: 'number',
                                description: 'Project ID',
                            },
                        },
                        required: ['project_id'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                switch (request.params.name) {
                    case 'get_issues': {
                        if (!isValidIssuesArgs(request.params.arguments)) {
                            throw new McpError(ErrorCode.InvalidParams, 'Invalid issues arguments');
                        }

                        const { project_id, status_id, assigned_to_id, limit = 25 } = request.params.arguments;
                        const params: any = { limit, include: 'spent_hours' };

                        if (project_id) params.project_id = project_id;
                        if (status_id) params.status_id = status_id;
                        if (assigned_to_id) params.assigned_to_id = assigned_to_id;

                        const response = await this.axiosInstance.get<{ issues: RedmineIssue[] }>('issues.json', { params });

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data.issues, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_projects': {
                        const response = await this.axiosInstance.get<{ projects: RedmineProject[] }>('projects.json');

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data.projects, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_project_issues': {
                        if (!isValidProjectArgs(request.params.arguments)) {
                            throw new McpError(ErrorCode.InvalidParams, 'Invalid project arguments');
                        }

                        const { project_id } = request.params.arguments;
                        const response = await this.axiosInstance.get<{ issues: RedmineIssue[] }>(`projects/${project_id}/issues.json`, {
                            params: { include: 'spent_hours' }
                        });

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data.issues, null, 2),
                                },
                            ],
                        };
                    }

                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Redmine API error: ${error.response?.data?.message ?? error.message}`,
                            },
                        ],
                        isError: true,
                    };
                }
                throw error;
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Redmine MCP server running on stdio');
    }
}

const server = new RedmineServer();
server.run().catch(console.error);
