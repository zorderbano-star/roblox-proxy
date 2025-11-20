const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; 

// IMPORTANT: In a real environment, replace '*' with your LP's domain (e.g., 'https://yourdomain.com')
app.use(cors({ origin: '*', methods: 'GET' }));

// Helper to get User ID and Display Name from Username
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

// Helper to get Avatar URL from User ID
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