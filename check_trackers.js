const fs = require('fs');
const envPath = 'c:/Users/tanphan/Desktop/Redmine_Project/redmine-server/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const apiKey = env.REDMINE_API_KEY;
const url = env.REDMINE_URL;

async function checkTrackers() {
    try {
        const response = await fetch(`${url}/trackers.json`, {
            headers: { 'X-Redmine-API-Key': apiKey }
        });
        const data = await response.json();
        console.log(JSON.stringify(data.trackers, null, 2));
    } catch (e) {
        console.error(e);
    }
}
checkTrackers();
