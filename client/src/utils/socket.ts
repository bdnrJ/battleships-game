import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_SOCKET_API}`); // Replace with your server URL

export default socket;
