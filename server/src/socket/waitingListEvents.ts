import { Server } from "socket.io";
import { GameRoom, GameStage, WaitingRoom } from "./types.js";
import { v4 } from "uuid";

export function setupWaitingListEvents(io: Server, playersWaitingRoom: WaitingRoom, rooms: GameRoom[]) {
    io.on("connection", (socket) => {

      socket.on("joinWaitingRoom", (nickname: string) => {
        if (playersWaitingRoom.waitingList.length > 1) {
          socket.emit("quickGameError", "Waiting room is already full somehow...");
          console.log("--- ERROR ---: global waiting room had 2 players and third one tried to join, bad!");
          return;
        }
  
        if (playersWaitingRoom.waitingList.find((client) => client.id === socket.id)) {
          socket.emit("quickGameError", "You are already in a waiting room");
          return;
        }
  
        playersWaitingRoom.waitingList.push({ nickname: nickname, id: socket.id });
        socket.join("GlobalWaitingRoom");
        socket.emit("inWaitingList");
  
        if (playersWaitingRoom.waitingList.length > 1) {
          // console.log(playersWaitingRoom);
          const randomRoomId = v4();
  
          const newRoom: GameRoom = {
            id: randomRoomId,
            roomName: "Quick Game Room",
            hostName: playersWaitingRoom.waitingList[0].nickname,
            clients: [],
            gameState: GameStage.WAITING,
  
            hasPassword: false,
            password: "",
          };
  
          rooms.push(newRoom);
  
          const socketsInRoom = io.sockets.adapter.rooms.get("GlobalWaitingRoom");
          // console.log("Sockets in GlobalWaitingRoom:", socketsInRoom);
  
          //this is where the fun begins
          //so idk why but it seems like when someone joins waiting room as the second player
          //and i try here to emit event to 'GlobalWaitingRoom' second player is not getting this
          //even when im 100% sure he is in this room, even delaying event by 1s does nothing
          //as this still bugs out so what i did is just take sockets connected to the 'GlobalWaitingRoom'
          //and send to each one of them evenet to join room separatly - quite retarded but this way
          //this works ;)
          if (socketsInRoom) {
            // Convert the Set of socket IDs to an array
            const socketIds = Array.from(socketsInRoom);
  
            // Iterate through the array of socket IDs and emit an event to each socket
            socketIds.forEach((socketId) => {
              // Get the socket instance using the socket ID
              const socket = io.sockets.sockets.get(socketId);
  
              // Emit an event to the socket and leave GlobalWaitingRoom
              if (socket) {
                socket.emit("joinQuickGameRoom", randomRoomId);
                socket.leave("GlobalWaitingRoom");
              }
            });
  
            playersWaitingRoom.waitingList = [];
          }
        }
      });
  
      socket.on("leaveWaitingList", () => {
        playersWaitingRoom.waitingList = playersWaitingRoom.waitingList.filter((client) => client.id !== socket.id);
      });
    });
}
