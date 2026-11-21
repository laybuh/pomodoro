import { Client } from "@upstash/qstash";

const client = new Client({ token: process.env.QSTASH_TOKEN, baseUrl: process.env.QSTASH_URL });

export async function POST(request) {
    const { subscription, endTime, title, body } = await request.json();

    if (!subscription || !endTime) {
        return Response.json({ error: "missing subscription or endTime" }, { status: 400 });
    }

    const result = await client.publishJSON({
        url: new URL("/api/send", request.url).href,
        body: { subscription, title, body },
        notBefore: Math.floor(endTime / 1000),
        retries: 1
    });

    return Response.json({ messageId: result.messageId });
}
