import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Detect Socket URL based on environment
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }
  
  return 'https://go-delivery-1.onrender.com';
};

export const getSocket = (): Socket => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });
  }
  return socket!;
};

