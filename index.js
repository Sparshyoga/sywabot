require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Webhook Verification (Required by Meta)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook Verified');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Handle Incoming Messages
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const phone_number_id = PHONE_NUMBER_ID;
                const from = body.entry[0].changes[0].value.messages[0].from; // sender ID
                const msg_body = body.entry[0].changes[0].value.messages[0].text.body;

                console.log('Received Message:', msg_body);

                // Simple Logic
                let reply = "Welcome! Reply '1' for pricing, '2' for location.";

                if (msg_body === '1') {
                    reply = "Here is our pricing: https://yourwebsite.com/pricing";
                } else if (msg_body === '2') {
                    reply = "Our location: https://maps.google.com/yourlocation";
                }

                await axios({
                    method: 'POST',
                    url: `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
                    headers: {
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        messaging_product: 'whatsapp',
                        to: from,
                        text: { body: reply }
                    }
                });

                console.log('Reply sent:', reply);
            }

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error handling message:', error);
        res.sendStatus(500);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
