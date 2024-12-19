'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StatusToggle({ 
  userId, 
  initialStatus 
}: { 
  userId: number;
  initialStatus: boolean;
}) {
  const [isOn, setIsOn] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          status: !isOn 
        }),
      });
      setIsOn(!isOn);
      router.refresh(); // Refresh the page to update all statuses
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={isLoading}
      className={`
        px-4 py-2 rounded-full transition-colors
        ${isOn 
          ? 'bg-green-500 hover:bg-green-600 text-white' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }
        disabled:opacity-50
      `}
    >
      {isOn ? 'Online' : 'Offline'}
    </button>
  );
}