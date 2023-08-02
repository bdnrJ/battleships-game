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
  clientNicknames: string[],
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
    // console.log(rooms);
  };

  const cleanupRooms = () => {
    rooms.forEach((room, index) => {
      if (room.clients.length === 0) {
        console.log("cleaned rooms");
        rooms.splice(index, 1);
      }
    });
  };


  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    const onRoomLeave = (roomId: string, nickname: string) => {
      const room = rooms.find((roomX) => roomX.id === roomId);
      if (room) {
        //removing client ids and their frontend nicknames (kinda hacky)
        room.clients = room.clients.filter((client) => client !== socket.id);
        room.clientNicknames = room.clientNicknames.filter((client) => client !== nickname)

        //if 0 clients left this will clear them
        cleanupRooms();

        //if room wasnt delted by cleanup - emit message
        if (room) {
          const someoneLeft = {
            updatedRoom: room,
            idOfUserThatLeft: socket.id
          }

          io.to(roomId).emit('someoneLeft', someoneLeft, nickname);
        }
        console.log("someone left room");
      }
    }
    // Function to check if a client is already in a room
    const isClientInRoom = (roomId: string) => {
      return rooms.some((room) => room.clients.includes(socket.id) && room.id !== roomId);
    };

    socket.on('createRoom', ({ roomName, hostName, hasPassword, password, id }: GameRoom, nickname: string) => {
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
        clients: [],
        clientNicknames: []
      };

      rooms.push(newRoom);

      const thisNewRoom = rooms.find((r) => r.id === id);
      if (!thisNewRoom) {
        console.log("total error");
        return;
      }
      //first create and then join as client to prevent bugs with wrong messages displaying on the fronted
      thisNewRoom.clients.push(socket.id);
      thisNewRoom.clientNicknames.push(nickname);
      socket.join(id);

      console.log("room has been created")
      socket.emit('createdAndJoined', newRoom)
      emitRoomsList();
    });

    socket.on('joinRoom', (roomId: string, nickname: string) => {
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

      if (room.clients.find((client) => client === socket.id)) {
        console.log("you cant play with yourself bitch");
        return;
      }

      // Join the room

      console.log("joined into room")
      socket.join(roomId);

      room.clients.push(socket.id);
      room.clientNicknames.push(nickname);

      socket.emit('roomJoined', room);

      io.to(roomId).emit('someoneJoined', room, nickname);

      emitRoomsList();
    });

    socket.on('leaveRoom', (roomId: string, nickname: string) => {
      onRoomLeave(roomId, nickname);
    })

    socket.on('getRooms', () => {
      emitRoomsList();
    })

    socket.on('sendMessage', (message: string, roomId: string, nickname: string) => {
      console.log("send message by " + nickname)
      io.to(roomId).emit('recieveMessage', message, nickname);
    })

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Remove the client from any rooms when disconnected
      rooms.forEach((room) => {
        if (room.clients.includes(socket.id)) {
          //hacky way of getting nickname of user that left
          //this exists becasue if someone closes their web browser entirely
          //frontend has no way of firing function responsible for proper cleanup
          const clientIdx = room.clients.findIndex((client) => client === socket.id);
          const userNicknameThatLeft = room.clientNicknames[clientIdx];
          onRoomLeave(room.id, userNicknameThatLeft);
        }
        room.clients = room.clients.filter((client) => client !== socket.id);
      });

      //Remove empty rooms
      cleanupRooms()
    });
  });

  return httpServer;
}
