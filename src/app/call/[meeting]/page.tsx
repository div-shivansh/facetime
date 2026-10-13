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
  const { 
    isMute: isMicMute, 
    hasBrowserPermission: hasMicPermission,
    devices: micDevices,
    selectedDevice: selectedMic
   } = useMicrophoneState();

  const { 
    isMute: isCamMute, 
    hasBrowserPermission: hasCamPermission,
    devices: camDevices,
    selectedDevice: selectedCam
   } = useCameraState();
  const router = useRouter();
  const [hardwareError, setHardwareError] = useState<string | null>(null);

  if (callingState !== 'joined') {
    return <div className="text-white text-2xl">Joining meeting...</div>;
  }

  const toggleMic = async () => {
    try {
      setHardwareError(null);
      await call?.microphone.toggle();
    } catch (err) {
      console.error("Microphone error:", err);
      setHardwareError("Microphone blocked or not found. Please check your browser permissions and try again.");
    }
  };

  const toggleCam = async () => {
    try {
      setHardwareError(null);
      await call?.camera.toggle();
    } catch (err) {
      console.error("Camera error:", err);
      setHardwareError("Camera blocked or not found. Check your browser permissions.");
    }
  };

  const leaveCall = async () => {
    await call?.leave();
    router.push('/');
  };

  return (
    <div className='flex flex-col items-center justify-center gap-10 container mx-auto h-4/5 mb-10 bg-neutral-700/50 rounded-lg p-5 relative'>

      {/* 3. Render the error banner if an error occurs */}
      {hardwareError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-md bg-red-500 text-white px-4 py-3 rounded-md shadow-lg z-50 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold">{hardwareError}</p>
          <button
            onClick={() => setHardwareError(null)}
            className="text-xl font-bold hover:text-neutral-300 transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Optional: Show a persistent warning if they explicitly denied permissions */}
      {(hasMicPermission === false || hasCamPermission === false) && !hardwareError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max bg-orange-500/90 text-white px-4 py-2 rounded-md shadow-lg z-40 text-sm font-semibold">
          Browser permissions are currently blocking your media devices.
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 overflow-hidden'>
        {participants.map((p) => (
          <div key={p.sessionId} className='w-full h-full rounded-xl overflow-hidden flex items-center justify-center relative border border-neutral-600'>
            <ParticipantView participant={p} ParticipantViewUI={null}  />
          </div>
        ))}
      </div>

      {/* Controls Wrapper */}
      <div className='flex flex-col items-center gap-4 w-full max-w-2xl mt-4'>
        
        {/* Device Selectors */}
        <div className='flex items-center justify-center gap-4 w-full text-sm'>
          {/* Only render microphone selector if permissions are granted and devices exist */}
          {hasMicPermission !== false && micDevices && micDevices.length > 0 && (
            <select 
              value={selectedMic || ''}
              onChange={async (e) => {
                try {
                  await call?.microphone.select(e.target.value);
                } catch(err) {
                  setHardwareError("Failed to switch microphone.");
                }
              }}
              className="bg-neutral-800 text-white border border-neutral-600 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 w-48 truncate cursor-pointer appearance-none"
            >
              {micDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || 'Unknown Microphone'}
                </option>
              ))}
            </select>
          )}

          {/* Only render camera selector if permissions are granted and devices exist */}
          {hasCamPermission !== false && camDevices && camDevices.length > 0 && (
            <select 
              value={selectedCam || ''}
              onChange={async (e) => {
                try {
                  await call?.camera.select(e.target.value);
                } catch(err) {
                  setHardwareError("Failed to switch camera.");
                }
              }}
              className="bg-neutral-800 text-white border border-neutral-600 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 w-48 truncate cursor-pointer appearance-none"
            >
              {camDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || 'Unknown Camera'}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Existing Action Buttons */}
        <div className='flex items-center justify-center gap-10'>
          <button 
            onClick={toggleMic}
            className={`${hasMicPermission === false ? 'bg-orange-500' : isMicMute ? 'bg-red-500' : 'bg-neutral-700/80'} hover:opacity-90 p-4 cursor-pointer text-2xl rounded-full text-white transition-all`}
          >
            {isMicMute ? <FaMicrophoneSlash /> : <FaMicrophoneLines />}
          </button>
          
          <button 
            onClick={toggleCam}
            className={`${hasCamPermission === false ? 'bg-orange-500' : isCamMute ? 'bg-red-500' : 'bg-neutral-700/80'} hover:opacity-90 p-4 cursor-pointer text-2xl rounded-full text-white transition-all`}
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
    </div>
  )
}

function VideoCalling() {
  const [client, setClient] = useState<StreamVideoClient | null>(null)
  const [call, setCall] = useState<Call | null>(null)
  const [error, setError] = useState<string | null>(null)
  const params = useParams<{ meeting: string }>()
  const meetingId = params.meeting
  const router = useRouter()

  useEffect(() => {
    let isMounted = true;
    let _client: StreamVideoClient
    let _call: Call

    const initVideo = async () => {
      if (!meetingId) return;

      try {
        let localUserId = localStorage.getItem('guest_user_id');
        if (!localUserId) {
          localUserId = `guest_${crypto.randomUUID()}`
          localStorage.setItem('guest_user_id', localUserId);
        }
        const res = await fetch('/api/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: meetingId, userId: localUserId })
        });

        if (!res.ok) {
          const errorText = await res.text();
          setError(`Server Error: ${errorText || "Could not connect to stream"}`);
          return;
        }

        const { token, userId } = await res.json() as { token: string, userId: string };

        if (!token || !isMounted) return;

        const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

        const _client = new StreamVideoClient({
          apiKey: apiKey,
          user: { id: userId, name: "Anonymous Guest" },
          token: token,
        });
        setClient(_client);

        _call = _client.call('default', meetingId);
        _call.join({ create: true });
        setCall(_call);

      } catch (err) {
        console.error("Error connecting:", err);
      }
    };

    initVideo();

    return () => {
      isMounted = false;
      if (_call) {
        _call.leave().catch(() => { });
      }
      if (_client) {
        _client.disconnectUser().catch(() => { });
      }
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
    )
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
          <MeetingUI />
        </StreamCall>
      </main>
    </StreamVideo>
  )
}

export default VideoCalling