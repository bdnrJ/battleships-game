import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { Express } from 'express';
import { allowedOrigins } from '../config/cors.js';


type matrix = number[][]

enum GameStage {
  WAITING = 0,
  PLACEMENT = 1,
  PLAYING = 2,
}

enum CellType{
  NORMAL = 0,
  HIT = 1,
  DAMAGED = 2,
  DEAD = 3,
  AROUNDDEAD = 4,
}

type gameplayState = {
  roomId: string,
  player1: string,
  player1Board: matrix,
  player2: string,
  player2Board: matrix,
}

interface GameRoom {
  id: string;
  roomName: string;
  hostName: string;

  clients: string[];
  clientNicknames: string[],
  clientBoards:  matrix[]
  clientReady: boolean[]

  gameState: number,

  hasPassword: boolean;
  password: string;
}

export default function setupSocketIO(app: Express) {
  const httpServer: HttpServer = createServer(app);
  const io: Server = new Server(httpServer, {
    cors: {
      origin: "*",
      // origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  const rooms: GameRoom[] = [];
  const gamePlayBoards: gameplayState[] = [];
  const emptyMatrix: matrix = Array.from({ length: 10 }, () => Array(10).fill(0));

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

        if(room.gameState !== GameStage.WAITING){
          room.clients = []
          cleanupRooms();

          //TODO message that room is being deleted
        }
        //removing client ids and their frontend nicknames (kinda hacky)
        room.clients = room.clients.filter((client) => client !== socket.id);
        room.clientNicknames = room.clientNicknames.filter((client) => client !== nickname)

        //if 0 clients left this will remove room
        cleanupRooms();

        //if room wasnt deleted by cleanup() - emit message and reset readyCheck 
        if (room) {

          room.clientReady = [false, false];

          if (!room.clientNicknames.includes(room.hostName)) {
            room.hostName = room.clientNicknames[0]
          }

          const someoneLeft = {
            updatedRoom: room,
            idOfUserThatLeft: socket.id
          }

          io.to(roomId).emit('someoneLeft', someoneLeft, nickname);
        }
        console.log("someone left room");
      }
    }

    const isClientInRoom = (roomId: string) => {
      return rooms.some((room) => room.clients.includes(socket.id) && room.id !== roomId);
    };

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

    //room systems 

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

      
      const newRoom: GameRoom = {
        id: id,
        roomName: roomName,
        hostName: hostName,
        clients: [],
        clientNicknames: [],
        clientBoards: [emptyMatrix, emptyMatrix],
        gameState: GameStage.WAITING,
        clientReady: [false, false],

        hasPassword: hasPassword,
        password: password,
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

    //waiting stage

    socket.on('declareReady', (roomId: string, nickname: string) => {
      console.log(`${nickname} declared ready`)
      const room = rooms.find((r) => r.id === roomId);

      if (!room) return;

      const playerIdx = room.clientNicknames.findIndex((nick) => nick === nickname);

      room.clientReady[playerIdx] = true;
      
      if (room.clientReady[0] && room.clientReady[1]) {
        room.gameState = GameStage.PLACEMENT
        io.to(roomId).emit('readinessChange', room)
      } else {
        io.to(roomId).emit('readinessChange', room)
      }
    })

    //placement stage
    
    socket.on('sendPlayerBoard', (board: matrix, nickname: string, roomId: string) => {
      const room = rooms.find((rm) => rm.id = roomId);

      if(!room) return;

      if(board.reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0) === 50){
        const playerIdx = room.clientNicknames.findIndex((nick) => nick === nickname);

        room.clientBoards[playerIdx] = board;

        //if both players provided finished boards
        if(room.clientBoards[0].reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0) === 50 &&  
          room.clientBoards[1].reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0) === 50){
            //start game
            room.gameState = GameStage.PLAYING;

            const roomWithoutBoardStates: GameRoom = room;
            roomWithoutBoardStates.clientBoards = []

            const gameStateBoards: gameplayState  ={
              roomId: room.id,
              player1: room.clientNicknames[0],
              player1Board: emptyMatrix,
              player2: room.clientNicknames[1],
              player2Board: emptyMatrix
            } 

            io.to(roomId).emit('startPlayingStage', roomWithoutBoardStates);
            io.to(roomId).emit('playingStageBoards', gameStateBoards);
        }
      }
    })

    //game stage
    socket.on('missleShot', (rowIdx: number, colIdx: number, nickname: string, roomId: string) => {
      const room = rooms.find((rm) => rm.id = roomId);

      if(!room) return;

      const enemyIdx = room.clientNicknames.findIndex((nick) => nick !== nickname);

      if(!enemyIdx) return;

      console.log(room.clientBoards)
      console.log(room.clientBoards[enemyIdx])
      console.log(room.clientBoards)

      if(room.clientBoards[enemyIdx][rowIdx][colIdx] === 0){
        
      }
    })

  });

  return httpServer;
}
