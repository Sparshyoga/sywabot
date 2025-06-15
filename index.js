import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config(); // load variables from .env file

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Verification endpoint
app.get('/webhook', (req, res) => {
    const verifyToken = process.env.VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Message handling endpoint
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        const phone_number_id = process.env.PHONE_NUMBER_ID;
        const access_token = process.env.ACCESS_TOKEN;

        body.entry.forEach(entry => {
            const changes = entry.changes;
            if (changes && changes.length > 0) {
                const message = changes[0].value.messages?.[0];
                if (message) {
                    const from = message.from;
                    const msg_body = message.text?.body;

                    console.log(`Received message from ${from}: ${msg_body}`);

                    // Here you can add reply logic
                }
            }
        });

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.listen(port, () => {
    console.log(`Webhook server running on port ${port}`);
});
