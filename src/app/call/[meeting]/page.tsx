"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StreamCall, StreamVideo, StreamVideoClient, Call } from '@stream-io/video-react-sdk';
import { MeetingRoom } from "../../components/MeetingRoom";

export default function VideoCalling() {
  const [client, setClient] = useState<StreamVideoClient | null>(null)
  const [call, setCall] = useState<Call | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const params = useParams<{meeting: string}>()
  const meetingId = params.meeting
  const router = useRouter()

  useEffect(() => {
    let isMounted = true;
    let _client: StreamVideoClient;
    let _call: Call;

    const initVideo = async () => {
      if (!meetingId) return;

      try {
        let localUserId = localStorage.getItem('guest_user_id');
        if (!localUserId) {
          localUserId = `guest_${crypto.randomUUID()}`;
          localStorage.setItem('guest_user_id', localUserId);
        }

        const res = await fetch('/api/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: meetingId, userId: localUserId })
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          setError(`Server Error: ${errorText || "Could not connect to stream"}`);
          return;
        }

        const { token, userId } = await res.json() as {token: string, userId: string};

        if (!token || !isMounted) return; 

        const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

        _client = new StreamVideoClient({
          apiKey: apiKey,
          user: { id: userId, name: "Anonymous Guest" }, 
          token: token,
        });
        setClient(_client);

        _call = _client.call('default', meetingId);
        await _call.join({ create: true });
        setCall(_call);

      } catch (err) {
        console.error("Error connecting:", err);
      }
    };

    initVideo();

    return () => {
        isMounted = false; 
        if (_call) _call.leave().catch(() => {});
        if (_client) _client.disconnectUser().catch(() => {});
    }
  }, [meetingId]); 

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-800 text-white gap-6">
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-md">
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="bg-neutral-600 hover:bg-neutral-500 px-6 py-2 rounded-full transition-all"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!client || !call) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-800 text-white gap-4">
        <div className="w-8 h-8 border-4 border-neutral-500 border-t-white rounded-full animate-spin"></div>
        <p>Initializing Video Client...</p>
    </div>
  );

  return (
    <StreamVideo client={client}>
      <main className='h-screen w-screen bg-neutral-800 text-white overflow-hidden flex flex-col'>
        <div className='flex justify-center py-3 z-10'>
          <h1 className='font-bold text-3xl bg-neutral-700/90 py-1 px-4 rounded-md shadow-lg'>
            Room: {meetingId}
          </h1>
        </div>
        
        <StreamCall call={call}>
           <MeetingRoom />
        </StreamCall>
      </main>
    </StreamVideo>
  )
}