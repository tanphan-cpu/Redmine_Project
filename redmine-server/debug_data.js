import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const url = process.env.REDMINE_URL;
const key = process.env.REDMINE_API_KEY;

const TARGET_ID = 261506; // The Feature-like issue

async function debugIssue() {
    try {
        console.log(`Inspecting Issue #${TARGET_ID}...`);

        const res = await axios.get(`${url}/issues/${TARGET_ID}.json?include=children`, {
            headers: { 'X-Redmine-API-Key': key }
        });

        const issue = res.data.issue;
        console.log(`Parent Subject: ${issue.subject}`);
        console.log(`Parent Tracker: ${issue.tracker?.name}`);

        if (issue.children && issue.children.length > 0) {
            const childId = issue.children[0].id;
            console.log(`\nInspecting Child #${childId}...`);
            const childRes = await axios.get(`${url}/issues/${childId}.json`, {
                headers: { 'X-Redmine-API-Key': key }
            });
            const child = childRes.data.issue;
            console.log("--- Child Details ---");
            console.log(`Subject: ${child.subject}`);
            console.log(`Tracker: ${child.tracker?.name}`);
            console.log(`Category: ${child.category?.name}`);
            console.log(`Custom Fields:`, JSON.stringify(child.custom_fields, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugIssue();
