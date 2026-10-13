import React from 'react';
import { FaMicrophoneLines, FaVideo, FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa6";
import { MdCallEnd } from "react-icons/md";
import { Call } from '@stream-io/video-react-sdk';

interface MeetingControlsProps {
  call: Call | undefined;
  isMicMute: boolean;
  isCamMute: boolean;
  hasMicPermission?: boolean;
  hasCamPermission?: boolean;
  micDevices: MediaDeviceInfo[] | undefined;
  camDevices: MediaDeviceInfo[] | undefined;
  selectedMic: string | undefined;
  selectedCam: string | undefined;
  onHardwareError: (msg: string | null) => void;
  onLeaveCall: () => void;
}

export const MeetingControls = ({
  call, isMicMute, isCamMute, hasMicPermission, hasCamPermission,
  micDevices, camDevices, selectedMic, selectedCam, onHardwareError, onLeaveCall
}: MeetingControlsProps) => {

  const toggleMic = async () => {
    try {
      onHardwareError(null);
      await call?.microphone.toggle();
    } catch (err) {
      onHardwareError("Microphone blocked or not found. Check your browser permissions.");
    }
  };

  const toggleCam = async () => {
    try {
      onHardwareError(null);
      await call?.camera.toggle();
    } catch (err) {
      onHardwareError("Camera blocked or not found. Check your browser permissions.");
    }
  };

  return (
    <div className='flex flex-col items-center gap-4 w-full max-w-2xl mt-4'>
      <div className='flex items-center justify-center gap-4 w-full text-sm'>
        {hasMicPermission !== false && micDevices && micDevices.length > 0 && (
          <select 
            value={selectedMic || ''}
            onChange={async (e) => {
              try { await call?.microphone.select(e.target.value); } 
              catch(err) { onHardwareError("Failed to switch microphone."); }
            }}
            className="bg-neutral-800 text-white border border-neutral-600 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 w-48 truncate cursor-pointer appearance-none"
          >
            {micDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || 'Unknown Microphone'}</option>
            ))}
          </select>
        )}

        {hasCamPermission !== false && camDevices && camDevices.length > 0 && (
          <select 
            value={selectedCam || ''}
            onChange={async (e) => {
              try { await call?.camera.select(e.target.value); } 
              catch(err) { onHardwareError("Failed to switch camera."); }
            }}
            className="bg-neutral-800 text-white border border-neutral-600 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 w-48 truncate cursor-pointer appearance-none"
          >
            {camDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || 'Unknown Camera'}</option>
            ))}
          </select>
        )}
      </div>

      <div className='flex items-center justify-center gap-10'>
        <button onClick={toggleMic} className={`${hasMicPermission === false ? 'bg-orange-500' : isMicMute ? 'bg-red-500' : 'bg-neutral-700/80'} hover:opacity-90 p-4 cursor-pointer text-2xl rounded-full text-white transition-all`}>
          {isMicMute ? <FaMicrophoneSlash /> : <FaMicrophoneLines />}
        </button>
        <button onClick={toggleCam} className={`${hasCamPermission === false ? 'bg-orange-500' : isCamMute ? 'bg-red-500' : 'bg-neutral-700/80'} hover:opacity-90 p-4 cursor-pointer text-2xl rounded-full text-white transition-all`}>
           {isCamMute ? <FaVideoSlash /> : <FaVideo />}
        </button>
        <button onClick={onLeaveCall} className='bg-red-700/80 hover:bg-red-600 p-4 cursor-pointer text-2xl rounded-full text-white transition-all'>
          <MdCallEnd />
        </button>
      </div>
    </div>
  );
}