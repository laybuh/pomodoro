import { Receiver } from "@upstash/qstash";
import { setVapidDetails, sendNotification } from "web-push";

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY
});

setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

export async function POST(request) {
    const rawBody = await request.text();
    const signature = request.headers.get("upstash-signature") || "";
    const valid = await receiver.verify({ signature, body: rawBody }).catch(() => false);

    if (!valid) {
        return new Response("invalid signature", { status: 401 });
    }

    const { subscription, title, body } = JSON.parse(rawBody);

    try {
        await sendNotification(subscription, JSON.stringify({ title, body }), { TTL: 300, urgency: "high" });
    }
    catch (error) {
        if (error.statusCode == 404 || error.statusCode == 410) {
            return new Response("subscription expired", { status: 200 });
        }
        return new Response("push failed", { status: 500 });
    }

    return new Response("sent", { status: 200 });
}
