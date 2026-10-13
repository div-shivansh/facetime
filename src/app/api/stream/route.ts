import { NextResponse, NextRequest } from "next/server"
import { StreamClient } from "@stream-io/node-sdk"

export async function POST(req: NextRequest) {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;
    const secret = process.env.STREAMSECRET!;

    if (!apiKey || !secret){
        return new NextResponse("Stream API credentials missing", {status: 500})
    }

    const body = await req.json()
    const { id: meetingId, userId } = body

    if (!meetingId || typeof meetingId !== 'string' || !meetingId.trim()) {
        return new NextResponse("Meeting ID is missing or invalid", {status: 400})
    }
    
    const user_id = userId || crypto.randomUUID()
    const client = new StreamClient(apiKey, secret, {timeout: 6000})
    const token  = client.generateUserToken({
        user_id: user_id,
    })

    return NextResponse.json({ userId: user_id, token: token, meetingId: meetingId }, {status: 201 })
}