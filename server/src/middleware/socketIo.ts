import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { Express } from 'express';
import { allowedOrigins } from '../config/cors.js';

interface GameRoom {
  id: string;
  roomName: string;
  hostName: string;
  hasPassword: boolean;
  password: string;
  clients: string[];
}

export default function setupSocketIO(app: Express) {
  const httpServer: HttpServer = createServer(app);
  const io: Server = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  const rooms: GameRoom[] = [];

  const emitRoomsList = () => {
    // io.emit('roomsList', rooms.map((room) => ({ ...room, clients: room.clients.length })));
    io.emit('roomsList', rooms);
    console.log("emitted rooms");
    console.log(rooms);
  };

  const cleanupRooms = () => {
    console.log("cleander rooms");
    rooms.forEach((room, index) => {
      if (room.clients.length === 0) {
        rooms.splice(index, 1);
      }
    });
  };


  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    const onRoomLeave = (roomId: string) => {
      const room = rooms.find((roomX) => roomX.id === roomId);
      if (room) {
        room.clients = room.clients.filter((client) => client !== socket.id);
        cleanupRooms();
      }
      console.log("someone left room");
    }
    // Function to check if a client is already in a room
    const isClientInRoom = (roomId: string) => {
      return rooms.some((room) => room.clients.includes(socket.id) && room.id !== roomId);
    };

    socket.on('createRoom', ({ roomName, hostName, hasPassword, password, id }: GameRoom) => {
      if (isClientInRoom(id)) {
        socket.emit('roomError', 'You are already in a room.');
        return;
      }

      // Check if the room already exists
      const existingRoom = rooms.find((room) => room.id === id);
      if (existingRoom) {
        socket.emit('roomError', 'A room with the same ID already exists.');
        return;
      }

      const newRoom = {
        id: id,
        roomName: roomName,
        hostName: hostName,
        hasPassword: hasPassword,
        password: password,
        clients: [socket.id],
      };

      rooms.push(newRoom);

      console.log("room has been created")
      socket.emit('createdAndJoined', newRoom)
      emitRoomsList();
    });

    socket.on('joinRoom', (roomId: string) => {
      console.log("joined into room")
      if (isClientInRoom(roomId)) {
        socket.emit('roomError', 'You are already in a room.');
        return;
      }

      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        socket.emit('roomError', 'Room does not exist.');
        return;
      }

      if (room.clients.length >= 2) {
        socket.emit('roomError', 'Room is full.');
        return;
      }

      if(room.clients.find((client) => client === socket.id)){
        console.log("you cant play with yourself bitch");
        return;
      }

      // Join the room
      socket.join(roomId);
      room.clients.push(socket.id);

      // Emit a 'roomJoined' event to the client that joined the room
      socket.emit('roomJoined', room);

      // Emit the updated list of rooms to all connected clients
      emitRoomsList();
    });

    socket.on('leaveRoom', (roomId: string) => {
      console.log("left a room");
      onRoomLeave(roomId);
    })

    socket.on('getRooms', () => {
      emitRoomsList();
    })

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Remove the client from any rooms when disconnected
      rooms.forEach((room) => {
        room.clients = room.clients.filter((client) => client !== socket.id);
      });

      //Remove empty rooms
      cleanupRooms()
    });
  });

  return httpServer;
}
