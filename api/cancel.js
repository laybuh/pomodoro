import { Client } from "@upstash/qstash";

const client = new Client({ token: process.env.QSTASH_TOKEN, baseUrl: process.env.QSTASH_URL });

export async function POST(request) {
    const { messageId } = await request.json();

    if (!messageId) {
        return Response.json({ error: "missing messageId" }, { status: 400 });
    }

    try {
        await client.messages.delete(messageId);
    }
    catch (error) {
        return Response.json({ cancelled: false });
    }

    return Response.json({ cancelled: true });
}
