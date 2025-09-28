import React, { useState, useEffect } from 'react';
import { healthCheck, ApiError } from '../services/api.js';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ApiStatus() {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'disconnected', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setStatus('checking');
        const response = await healthCheck();
        setStatus('connected');
        setMessage(response.message || 'Backend connected');
      } catch (error) {
        if (error instanceof ApiError && error.status === 0) {
          setStatus('disconnected');
          setMessage('Backend server not running');
        } else {
          setStatus('error');
          setMessage('Connection error');
        }
      }
    };

    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Backend Connected</span>
      </div>
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <XCircle className="w-4 h-4" />
        <span>Backend Offline</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-orange-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Connection Issues</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-600 text-sm">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
      <span>Checking Connection...</span>
    </div>
  );
}