const fs = require('fs');
const path = require('path');

// Read env from redmine-server
const envPath = 'c:/Users/tanphan/Desktop/Redmine_Project/redmine-server/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const apiKey = env.REDMINE_API_KEY;
const url = env.REDMINE_URL;

async function checkProjects() {
    try {
        const response = await fetch(`${url}/projects.json?limit=100`, {
            headers: { 'X-Redmine-API-Key': apiKey }
        });
        const data = await response.json();
        console.log("Projects found:");
        data.projects.forEach(p => {
            console.log(`- ID: ${p.id}, Name: "${p.name}"`);
        });
    } catch (e) {
        console.error("Error fetching projects", e.message);
    }
}

checkProjects();
