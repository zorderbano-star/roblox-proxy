const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; 

// IMPORTANT: Replace '*' with your LP's domain for production
app.use(cors({ origin: '*', methods: 'GET' }));
app.use(express.json()); // Middleware to parse JSON bodies

// --- NEW ENDPOINT: Get Display Name from User ID ---
app.get('/getDisplayNameFromId', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).send({ error: "User ID required." });

    try {
        // Roblox API to get user details from ID
        const response = await axios.get(`https://users.roblox.com/v1/users/${userId}`);

        if (response.data && response.data.id) {
            res.json({ 
                userId: response.data.id, 
                displayName: response.data.displayName,
                username: response.data.name // The original username
            });
        } else {
            res.status(404).send({ error: "User ID not found or invalid." });
        }
    } catch (error) {
        // If Roblox returns 400 or 404, capture that.
        res.status(500).send({ error: "API error fetching user details from ID." });
    }
});

// --- EXISTING ENDPOINT: Get User ID from Username ---
app.get('/getUserId', async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(400).send({ error: "Username required." });

    try {
        // Roblox API to convert username to ID
        const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
            usernames: [username],
            excludeBannedUsers: true
        });

        if (response.data.data.length > 0) {
            const user = response.data.data[0];
            res.json({ userId: user.id, displayName: user.displayName || user.name }); 
        } else {
            res.status(404).send({ error: "User not found." });
        }
    } catch (error) {
        res.status(500).send({ error: "API error fetching user ID." });
    }
});

// --- EXISTING ENDPOINT: Get Avatar URL from User ID ---
app.get('/getAvatar', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).send({ error: "User ID required." });

    try {
        // Roblox API to get Avatar Headshot URL
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);

        if (response.data.data.length > 0) {
            const avatarUrl = response.data.data[0].imageUrl;
            res.json({ avatarUrl });
        } else {
            res.status(404).send({ error: "Avatar not found." });
        }
    } catch (error) {
        res.status(500).send({ error: "API error fetching avatar." });
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});
