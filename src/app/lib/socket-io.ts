import { io, Socket } from 'socket.io-client';
import { userDecode } from '../helpers/decodeJwt';

const URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.1.4:5000';

const user = userDecode()

const socket = io(URL, {
  query: { role: user?.position, userId: user?._id }, 
});

export default socket;

