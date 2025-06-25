export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  if (req.method === 'GET') {
    // Verification with Meta (when setting webhook)
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  } else if (req.method === 'POST') {
    const body = req.body;

    if (body.object) {
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      const from = message?.from;
      const text = message?.text?.body;

      if (text && from) {
        const sendMessage = async (replyText) => {
          await fetch(`https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: from,
              text: { body: replyText },
            }),
          });
        };

        // Bot Logic:
        if (['hi', 'hello'].includes(text.toLowerCase())) {
          await sendMessage(`🌿 Welcome to Sparsh Yoga! 🌿\n\nPlease select an option:\n1️⃣ Pricing Details\n2️⃣ Location\n3️⃣ Book a Free Trial`);
        } else if (text === '1') {
          await sendMessage(`🧘‍♀️ Class Schedule & Pricing:\n\nEvery class is Mon-Fri (Weight Loss: Mon-Sat)\n\nTime - Batch - Notes:\n6:30-7:30 AM: Weight Loss (Mon-Sat)\n7:30-8:30 AM: Regular\n9-11 AM: Ladies\n11-12 PM: Therapy\n4-5 PM: Therapy\n5-8 PM: Regular\n\nPricing (₹):\nWeight Loss: 2300/6000/11000/18000\nOther Batches: 1750/4500/8000/15000\nOnline: 1500/month\nPersonal: ₹500/session\nZoom available.`);
        } else if (text === '2') {
          await sendMessage(`📍 Our location:\nhttps://maps.app.goo.gl/4xiyAYdUBBHhRCpM9`);
        } else if (text === '3') {
          await sendMessage(`📝 Book your free trial here:\nhttps://forms.gle/REGoVa7cqoioESks8`);
        } else {
          await sendMessage(`Sorry, I didn't get that.\nPlease reply with:\n1️⃣ Pricing Details\n2️⃣ Location\n3️⃣ Book a Free Trial`);
        }

        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(405);
  }
}
