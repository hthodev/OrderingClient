import { io, Socket } from 'socket.io-client';
import { userDecode } from '../helpers/decodeJwt';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL;

const user = userDecode()

const socket = io(URL, {
    transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  query: { role: user?.position, userId: user?._id }, 
});

export default socket;

