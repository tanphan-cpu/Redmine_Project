const axios = require('axios');
require('dotenv').config({ path: 'c:/Users/tanphan/Desktop/Redmine_Project/redmine-server/.env.local' });

const apiKey = process.env.REDMINE_API_KEY;
const url = process.env.REDMINE_URL;

async function checkProjects() {
    try {
        const response = await axios.get(`${url}/projects.json`, {
            headers: { 'X-Redmine-API-Key': apiKey },
            params: { limit: 100 }
        });
        console.log("Projects found:");
        response.data.projects.forEach(p => {
            console.log(`- ID: ${p.id}, Name: "${p.name}"`);
        });
    } catch (e) {
        console.error("Error fetching projects", e.message);
    }
}

checkProjects();
