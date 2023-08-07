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

enum ShipTypes{
  DESTROYER = 1,
  CRUISER = 2,
  BATTLESHIP = 3,
  CARRIER = 4,
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
  turn: string,
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

  //offsets are used to determine whether a ship that has been hit is merely damaged or if it has been completely sunk
  const offsets = [
    [-1, -1],  [-1, 0],  [-1, 1],
    [0,  -1], /* cell */ [0,  1],
    [1,  -1],  [1,  0],  [1,  1],
  ];

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

            const roomWithoutBoardStates: GameRoom = {...room};
            roomWithoutBoardStates.clientBoards = []

            //were creating empty matrix like that because of shallow copying which
            //wasted at least 5h of debugging xd
            const gameStateBoards: gameplayState = {
              roomId: room.id,
              player1: room.clientNicknames[0],
              player1Board: [...emptyMatrix.map(row => [...row])],
              player2: room.clientNicknames[1],
              player2Board: [...emptyMatrix.map(row => [...row])],
              turn: Math.random() < 0.5 ? room.clientNicknames[0] : room.clientNicknames[1],
            } 

            gamePlayBoards.push(gameStateBoards);

            io.to(roomId).emit('startPlayingStage', roomWithoutBoardStates);
            io.to(roomId).emit('playingStageBoards', gameStateBoards);
        }
      }
    })

    const isSunken = (rowIdx: number, colIdx: number, enemyBoard: matrix, myHitBoard: matrix): boolean => {
      for (const [offsetRow, offsetCol] of offsets) {
        const newRow = rowIdx + offsetRow;
        const newCol = colIdx + offsetCol;

        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
          if ([1, 2, 3, 4].includes(enemyBoard[newRow][newCol]) && myHitBoard[newRow][newCol] === CellType.NORMAL) {
              return false;
          }
        }
      }
      return true;
    }

    const onSunkenShipProcedure = (rowIdx: number, colIdx: number, enemyBoard: matrix, myHitBoard: matrix): void => {
      for (const [offsetRow, offsetCol] of offsets) {
        const newRow = rowIdx + offsetRow;
        const newCol = colIdx + offsetCol;

        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
          if ([1, 2, 3, 4].includes(enemyBoard[newRow][newCol]) && myHitBoard[newRow][newCol] !== CellType.DEAD) {
            myHitBoard[newRow][newCol] = CellType.DEAD;
            onSunkenShipProcedure(newRow, newCol, enemyBoard, myHitBoard);
          }else{
            if(myHitBoard[newRow][newCol] === CellType.DEAD){
              myHitBoard[newRow][newCol] = CellType.DEAD;
            }else{
              myHitBoard[newRow][newCol] = CellType.AROUNDDEAD;
            }
          }
        }
      }
    }

    //game stage
    // POOR
    //i think this stinks, each call from user needs to find user by nickname (searching an array) - i dont like this
    socket.on('missleShot', (rowIdx: number, colIdx: number, nickname: string, roomId: string) => {
      //finding room and gameplayState from where request is being made
      const room = rooms.find((rm) => rm.id === roomId);
      const gameplayState = gamePlayBoards.find((rm) => rm.roomId === roomId);

      //if they do not exist... well we're fucked
      if(!room) return;
      if(!gameplayState) return;

      if(gameplayState.turn !== nickname){
        console.log('player request move but it is not his turn')
        return;
      }
      
      console.log('1')
      
      //the player that makes the shot will shot to other player board (duh)
      //so we need to make sure that we're not shooting ourselfs up (:o)
      const enemyIdx = room.clientNicknames.findIndex((nick) => nick !== nickname);
      
      //if player shot empty field
      if(room.clientBoards[enemyIdx][rowIdx][colIdx] === CellType.NORMAL){
        if(gameplayState.player1 === nickname){
          console.log('3')
          gameplayState.player1Board[rowIdx][colIdx] = CellType.HIT;
        }else{
          console.log('4')
          gameplayState.player2Board[rowIdx][colIdx] = CellType.HIT;
        }
      }

      //if player shot not-empty field
      if([ShipTypes.DESTROYER, ShipTypes.BATTLESHIP, ShipTypes.CRUISER, ShipTypes.CARRIER].includes(room.clientBoards[enemyIdx][rowIdx][colIdx])){
        if(gameplayState.player1 === nickname){
          console.log('5')
          if(isSunken(rowIdx, colIdx, room.clientBoards[enemyIdx], gameplayState.player1Board)){
            onSunkenShipProcedure(rowIdx, colIdx, room.clientBoards[enemyIdx], gameplayState.player1Board);
          }
          else{
            gameplayState.player1Board[rowIdx][colIdx] = CellType.DAMAGED;
          }
        }else{
          console.log('6')
          if(isSunken(rowIdx, colIdx, room.clientBoards[enemyIdx], gameplayState.player2Board)){
            onSunkenShipProcedure(rowIdx, colIdx,  room.clientBoards[enemyIdx] ,gameplayState.player2Board);
          }
          else{
            gameplayState.player2Board[rowIdx][colIdx] = CellType.DAMAGED;
          }
        }
      }
      
      //return new updated state

      gameplayState.turn = room.clientNicknames[enemyIdx];
      
      console.log(gameplayState);
      console.log('end');

      io.to(roomId).emit('updateGameState', gameplayState);
    })

  });

  return httpServer;
}
