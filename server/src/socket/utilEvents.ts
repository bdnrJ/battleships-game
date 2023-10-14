import { Server } from "socket.io";

export function setupUtilEvents(io: Server, connectedPlayers: number) {
    io.on("connection", (socket) => {
      console.log(`New client connected: ${socket.id}`);
      connectedPlayers += 1;

      socket.on("getPlayers", () => {
        socket.emit("playerCount", connectedPlayers);
      });
    });
}
