import axios from 'axios';

const REDMINE_URL = 'https://projects.rsupport.com';
const API_KEY = '2d611604d9ac3fc0335459ace0a6d29a59670330';
const TICKET_ID = 262275;

async function debugTicket() {
    try {
        const apiClient = axios.create({
            baseURL: REDMINE_URL,
            headers: {
                'X-Redmine-API-Key': API_KEY,
                'Content-Type': 'application/json',
            },
        });

        console.log(`Fetching Ticket ${TICKET_ID}...`);
        const ticketRes = await apiClient.get(`/issues/${TICKET_ID}.json`);
        console.log('Main Ticket Info:', JSON.stringify(ticketRes.data.issue, null, 2));

        console.log(`\nFetching Sub-tasks for ${TICKET_ID}...`);
        // Redmine API: children are often in 'children' array if include=children is used, 
        // OR we can search for parent_id=TICKET_ID
        const subtasksRes = await apiClient.get(`/issues.json`, {
            params: {
                parent_id: TICKET_ID,
                status_id: '*',
                limit: 100
            }
        });

        console.log('Sub-tasks found:', subtasksRes.data.issues.length);
        subtasksRes.data.issues.forEach(issue => {
            console.log(`- [${issue.id}] ${issue.subject} (${issue.tracker.name}) - Assigned to: ${issue.assigned_to?.name}`);
        });

    } catch (e) {
        console.error('Error fetching data:', e.message);
        if (e.response) {
            console.error('Response data:', e.response.data);
        }
    }
}

debugTicket();
