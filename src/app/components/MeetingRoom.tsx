import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCall, useCallStateHooks, ParticipantView } from '@stream-io/video-react-sdk';
import { HardwareError } from './HardwareError';
import { MeetingControls } from './MeetingControls';

export const MeetingRoom = () => {
  const call = useCall();
  const router = useRouter();
  const [hardwareError, setHardwareError] = useState<string | null>(null);

  const { useCallCallingState, useParticipants, useMicrophoneState, useCameraState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  
  const { isMute: isMicMute, hasBrowserPermission: hasMicPermission, devices: micDevices, selectedDevice: selectedMic } = useMicrophoneState();
  const { isMute: isCamMute, hasBrowserPermission: hasCamPermission, devices: camDevices, selectedDevice: selectedCam } = useCameraState();

  if (callingState !== 'joined') {
    return <div className="text-white text-2xl flex items-center justify-center h-full">Joining meeting...</div>;
  }

  const leaveCall = async () => {
    await call?.leave();
    router.push('/');
  };

  return (
    <div className='flex flex-col items-center justify-center gap-6 container mx-auto h-4/5 mb-10 bg-neutral-700/50 rounded-lg p-5 relative'>
      
      <HardwareError 
        error={hardwareError} 
        onClearError={() => setHardwareError(null)}
        hasMicPermission={hasMicPermission}
        hasCamPermission={hasCamPermission}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 overflow-hidden'>
        {participants.map((p) => (
          <div key={p.sessionId} className='w-full h-full rounded-xl overflow-hidden flex items-center justify-center relative border border-neutral-600'>
            <ParticipantView participant={p} ParticipantViewUI={null} />
          </div>
        ))}
      </div>

      <MeetingControls 
        call={call}
        isMicMute={isMicMute}
        isCamMute={isCamMute}
        hasMicPermission={hasMicPermission}
        hasCamPermission={hasCamPermission}
        micDevices={micDevices}
        camDevices={camDevices}
        selectedMic={selectedMic}
        selectedCam={selectedCam}
        onHardwareError={setHardwareError}
        onLeaveCall={leaveCall}
      />
    </div>
  );
}