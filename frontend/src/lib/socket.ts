import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let identifiedToken: string | null = null;

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;

  if (typeof window !== 'undefined') {
    if ((window as unknown as { Capacitor?: { isNative?: boolean } }).Capacitor?.isNative) {
      return 'https://go-delivery-1.onrender.com';
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }

  return 'https://go-delivery-1.onrender.com';
};

const sendIdentify = (s: Socket) => {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) return;
  identifiedToken = token;
  s.emit('identify', { token });
};

export const getSocket = (): Socket => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
      // Re-identify so the server can rejoin the right rooms after a reconnect.
      if (socket) sendIdentify(socket);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });
  }

  // If a fresh login happened after the socket was created, re-identify.
  if (socket && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && token !== identifiedToken) sendIdentify(socket);
  }

  return socket!;
};

export const resetSocketIdentity = () => {
  identifiedToken = null;
};
