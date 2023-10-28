import { Server } from "socket.io";
import { GameRoom, GameStage } from "../types.js";

export function setupWaitingStageEvents(io: Server, rooms: GameRoom[]) {
    io.on("connection", (socket) => {

      socket.on("declareReady", (roomId: string, nickname: string) => {
        // console.log(`${nickname} declared ready`);
        const room = rooms.find((r) => r.id === roomId);
  
        if (!room) return;
  
        const playerIdx = room.clients.findIndex((client) => client.id === socket.id);
  
        room.clients[playerIdx].readiness = true;
  
        if (room.clients[0]?.readiness && room.clients[1]?.readiness) {
          room.gameState = GameStage.PLACEMENT;
        }
        io.to(roomId).emit("readinessChange", room);
      });
    });
}
