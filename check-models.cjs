const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env file
const envPath = path.join(__dirname, '.env');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_API_KEY=(.+)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env file:", e.message);
    process.exit(1);
}

if (!apiKey) {
    console.error("API Key not found in .env");
    process.exit(1);
}

console.log("Checking available models with API Key:", apiKey.slice(0, 5) + "...");

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", JSON.stringify(json.error, null, 2));
            } else {
                console.log("Available Models:");
                if (json.models) {
                    json.models.forEach(m => {
                        // geminiを含むモデル、かつgenerateContentをサポートしているものを表示
                        if (m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`- ${m.name}`);
                        }
                    });
                } else {
                    console.log("No models found in response.");
                }
            }
        } catch (e) {
            console.error("Failed to parse response:", e.message);
            console.log("Raw response:", data);
        }
    });
}).on('error', (e) => {
    console.error("Request error:", e.message);
});
