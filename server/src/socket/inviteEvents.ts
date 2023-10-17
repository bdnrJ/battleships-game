import { Server } from "socket.io";
import { GameRoom } from "./types";

export function setupInviteEvents(io: Server, rooms: GameRoom[]) {
	io.on("connection", (socket) => {
    

	});
}
