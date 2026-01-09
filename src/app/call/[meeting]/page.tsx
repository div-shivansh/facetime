"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FaMicrophoneLines, FaVideo, FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa6";
import { MdCallEnd } from "react-icons/md";
import { 
  StreamCall, 
  StreamVideo, 
  StreamVideoClient, 
  useCallStateHooks, 
  ParticipantView,
  useCall,
  Call
} from '@stream-io/video-react-sdk';

const MeetingUI = () => {
  const call = useCall();
  const { useCallCallingState, useParticipants, useMicrophoneState, useCameraState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const { isMute: isMicMute } = useMicrophoneState();
  const { isMute: isCamMute } = useCameraState();
  const router = useRouter();

  if (callingState !== 'joined') {
    return <div className="text-white text-2xl">Joining meeting...</div>;
  }

  const toggleMic = async () => {
    await call?.microphone.toggle();
  };

  const toggleCam = async () => {
    await call?.camera.toggle();
  };

  const leaveCall = async () => {
    await call?.leave();
    router.push('/');
  };

  return (
    <div className='flex flex-col items-center justify-center gap-10 container mx-auto h-4/5 mb-10 bg-neutral-700/50 rounded-lg p-5'>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 overflow-hidden'>
        {participants.map((p) => (
          <div key={p.sessionId} className='w-full h-full rounded-xl overflow-hidden flex items-center justify-center relative border border-neutral-600'>
            <ParticipantView participant={p} ParticipantViewUI={null}  />
          </div>
        ))}
      </div>

      <div className='flex items-center justify-center gap-10 mt-4'>
        <button 
          onClick={toggleMic}
          className={`${isMicMute ? 'bg-red-500' : 'bg-neutral-700/80'} hover:opacity-90 p-4 cursor-pointer text-2xl rounded-full text-white transition-all`}
        >
          {isMicMute ? <FaMicrophoneSlash /> : <FaMicrophoneLines />}
        </button>
        
        <button 
          onClick={toggleCam}
          className={`${isCamMute ? 'bg-red-500' : 'bg-neutral-700/80'} hover:opacity-90 p-4 cursor-pointer text-2xl rounded-full text-white transition-all`}
        >
           {isCamMute ? <FaVideoSlash /> : <FaVideo />}
        </button>
        
        <button 
          onClick={leaveCall}
          className='bg-red-700/80 hover:bg-red-600 p-4 cursor-pointer text-2xl rounded-full text-white transition-all'
        >
          <MdCallEnd />
        </button>
      </div>
    </div>
  )
}

function VideoCalling() {
  const [client, setClient] = useState<StreamVideoClient | null>(null)
  const [call, setCall] = useState<Call | null>(null)
  const params = useParams<{meeting: string}>()
  const meetingId = params.meeting

  useEffect(() => {
    const initVideo = async () => {
      if (!meetingId) return;

      try {
        const res = await fetch('/api/stream', {
          method: 'POST',
          body: JSON.stringify({ id: meetingId })
        });
        const { token, userId } = await res.json() as {token: string, userId: string};

        if (!token) return;

        const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

        const _client = new StreamVideoClient({
          apiKey: apiKey,
          user: { id: userId },
          token: token,
        });
        setClient(_client);

        const _call = _client.call('default', meetingId);
        await _call.join({ create: true });
        setCall(_call);

      } catch (err) {
        console.error("Error connecting:", err);
      }
    };

    initVideo();

    return () => {
        if (call) {
            call.leave();
        }
        if (client) {
            client.disconnectUser();
        }
    }
  }, [call, client, meetingId]);

  if (!client || !call) return (
    <div className="h-screen w-screen flex items-center justify-center text-white">
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
           <MeetingUI />
        </StreamCall>
      </main>
    </StreamVideo>
  )
}

export default VideoCalling