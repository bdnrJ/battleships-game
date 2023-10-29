import { Server } from "socket.io";
import { GameRoom } from "./types";
import { cleanupRooms, onRoomLeave } from "./roomEvents.js";

let connectedPlayers = 0;

export function setupUtilEvents(io: Server, rooms: GameRoom[]) {
	io.on("connection", (socket) => {
		console.log(`New client connected: ${socket.id}`);
		connectedPlayers += 1;

		socket.on("getPlayers", () => {
			socket.emit("playerCount", connectedPlayers);
		});

		socket.on("disconnect", () => {
			console.log(`Client disconnected: ${socket.id}`);
			connectedPlayers -= 1;
			// Remove the client from any rooms when disconnected
			rooms.forEach((room) => {
				if (room.clients[0]?.id === socket.id || room.clients[1]?.id === socket.id) {
					//hacky way of getting nickname of user that left
					//this exists becasue if someone closes their web browser entirely
					//frontend has no way of firing function responsible for proper cleanup (on component unmount)

					//TODO fixed with client obj
					const clientIdx = room.clients.findIndex((client) => client.id === socket.id);
					onRoomLeave(socket, io, rooms, room.id, room.clients[clientIdx].nickname);
					room.clients.splice(clientIdx, 1);
				}
			});

			//Remove empty rooms
			cleanupRooms(io, rooms);
		});
	});
}
