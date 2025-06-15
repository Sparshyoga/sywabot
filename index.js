// index.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Webhook Verification
app.get("/webhook", (req, res) => {
  const verifyToken = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Webhook for Receiving Messages
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = body.entry[0].changes[0].value.messages[0].from;
      const msg_body = body.entry[0].changes[0].value.messages[0].text.body;

      let responseMessage = "";

      if (msg_body) {
        switch (msg_body.trim()) {
          case "1":
            responseMessage = `📅 *Class Schedule:*
Every class is Monday to Friday, except Weight Loss (Mon-Sat):

*Time\tBatch Type\tNotes*
6:30 AM - 7:30 AM\tWeight Loss Batch\t(Mon-Sat)
7:30 AM - 8:30 AM\tRegular Batch\n9:00 AM - 10:00 AM\tLadies Batch\n10:00 AM - 11:00 AM\tLadies Batch\n11:00 AM - 12:00 PM\tYoga Therapy\n4:00 PM - 5:00 PM\tYoga Therapy\n5:00 PM - 6:00 PM\tRegular Batch\n6:00 PM - 7:00 PM\tRegular Batch\n7:00 PM - 8:00 PM\tRegular Batch

💰 *Pricing:*
*Batch Type\tMonthly\t3 Months\t6 Months\t12 Months*
Weight Loss Batch (6:30 AM)\t₹2,300\t₹6,000\t₹11,000\t₹18,000
Other Batches\t₹1,750\t₹4,500\t₹8,000\t₹15,000
Online Classes (6:30 AM, 5 PM, 6 PM, 7 PM via Zoom)\t₹1,500\t—\t—\t—

Personal Training: ₹500 per session\n(Online classes conducted via Zoom)`;
            break;
          case "2":
            responseMessage = "📍 *Location:* https://maps.app.goo.gl/4xiyAYdUBBHhRCpM9";
            break;
          case "3":
            responseMessage = "📝 *Book a Free Trial:* https://forms.gle/REGoVa7cqoioESks8";
            break;
          default:
            responseMessage = `🌿 Welcome to Sparsh Yoga! 🌿\n\nPlease select an option by replying with a number:\n\n1️⃣ Pricing Details of Yoga Classes\n2️⃣ Location of the Yoga Centre\n3️⃣ Book a Free Trial`;
        }
      }

      // Send the response message via Meta API
      fetch(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: responseMessage + "\n\nThank you for reaching out to Sparsh Yoga! 🌸" },
        }),
      }).then(response => console.log("Message sent!", response));
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
