import { io, Socket } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const socket: Socket = io(URL, {
  transports: ['websocket'],
});

export default socket;
