import React from 'react';

interface HardwareErrorProps {
  error: string | null;
  onClearError: () => void;
  hasMicPermission?: boolean;
  hasCamPermission?: boolean;
}

export const HardwareError = ({ error, onClearError, hasMicPermission, hasCamPermission }: HardwareErrorProps) => {
  return (
    <>
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-md bg-red-500 text-white px-4 py-3 rounded-md shadow-lg z-50 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold">{error}</p>
          <button 
            onClick={onClearError} 
            className="text-xl font-bold hover:text-neutral-300 transition-colors"
          >
            &times;
          </button>
        </div>
      )}
      {(hasMicPermission === false || hasCamPermission === false) && !error && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max bg-orange-500/90 text-white px-4 py-2 rounded-md shadow-lg z-40 text-sm font-semibold">
            Browser permissions are currently blocking your media devices.
         </div>
      )}
    </>
  );
};