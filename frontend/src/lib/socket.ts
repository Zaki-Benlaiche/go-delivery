import { io, Socket } from 'socket.io-client';
import { getToken } from '@/lib/storage';

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
  const token = getToken();
  if (!token) return;
  identifiedToken = token;
  // Legacy path — server still listens for this for older builds; new sockets
  // also pass the token in the handshake auth field below.
  s.emit('identify', { token });
};

export const getSocket = (): Socket => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(getSocketUrl(), {
      // websocket-only avoids the slower polling round-trip and stops Render's
      // edge from holding long-poll requests open. Server still accepts polling
      // as a fallback if a corporate proxy strips websockets, in which case
      // the client-side will surface a connect_error and we can reconfigure.
      transports: ['websocket'],
      // Pass the JWT in the handshake — server middleware validates it before
      // the socket gets a chance to consume any resources.
      auth: { token: getToken() },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5, // built-in jitter so reconnect storms don't sync
      timeout: 10000,
    });

    socket.on('connect', () => {
      // Re-identify after reconnect — handshake auth already covers this for
      // new sessions, but identify keeps backwards-compat with the server.
      if (socket) sendIdentify(socket);
    });

    socket.on('connect_error', (err) => {
      // Auth errors mean a stale token; force a reconnect cycle with the
      // current value (the user may have logged in/out in another tab).
      if (err.message === 'AUTH_INVALID' && socket) {
        socket.auth = { token: getToken() };
      }
    });
  }

  if (socket) {
    const token = getToken();
    if (token && token !== identifiedToken) sendIdentify(socket);
  }

  return socket!;
};

export const resetSocketIdentity = () => {
  identifiedToken = null;
  if (socket) {
    socket.auth = { token: null };
    // Force a clean handshake on next connect cycle.
    socket.disconnect();
    socket.connect();
  }
};
