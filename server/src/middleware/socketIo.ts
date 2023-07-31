// Assuming you have the 'allowedOrigins' variable defined in your cors.js file
import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { Express } from 'express';
import { allowedOrigins } from '../config/cors.js';
import { log } from 'console';

interface GameRoom {
  roomName: string,
  hostName: string,
  hasPassword: boolean,
  password: string,
}

export default function setupSocketIO(app: Express) {
  const httpServer: HttpServer = createServer(app);
  const io: Server = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  // Room data storage (You can replace this with your actual room management logic)
  const rooms: GameRoom[] = [];

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Emit the list of available rooms whenever a new client connects or a room is updated
    const emitRoomsList = () => {
      io.emit('roomsList', rooms);
      console.log(rooms);
    };

    emitRoomsList();

    socket.on('createRoom', ({ roomName, hostName, hasPassword, password }: GameRoom) => {
      // Implement your logic to create a new room on the server
      // For demonstration purposes, we'll just add a new room to the 'rooms' array
      const newRoom = {
        roomName: roomName,
        hostName: hostName,
        hasPassword: hasPassword,
        password: password
      };

      rooms.push(newRoom);

      // Emit the updated list of rooms to all connected clients
      emitRoomsList();
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Clean up any resources related to the disconnected client if needed
    });
  });

  return httpServer;
}
