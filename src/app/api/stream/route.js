import { NextResponse } from "next/server"
import { StreamClient } from "@stream-io/node-sdk"

export async function POST(req) {
    const user_id = crypto.randomUUID()

    const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY
    const secret = process.env.STREAMSECRET
    const client = new StreamClient(apiKey, secret, {timeout: 6000})
    const token = client.generateUserToken({
        user_id: user_id,
    })

    return NextResponse.json({ userId: user_id, token: token }, {status: 201 })
}