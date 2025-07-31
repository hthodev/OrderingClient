import { io, Socket } from 'socket.io-client';
import { userDecode } from '../helpers/decodeJwt';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL;

const user = userDecode()

const socket = io(URL, {
  query: { role: user?.position, userId: user?._id }, 
});

export default socket;

