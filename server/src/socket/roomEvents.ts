import { Server, Socket } from "socket.io";
import { Client, GameRoom, GameStage, matrix } from "./types.js";

export const emitRoomsList = (io: Server, rooms: GameRoom[]): void => {
	io.emit("roomsList", rooms);
	// console.log(rooms);
	console.log("emitted rooms");
};

export const cleanupRooms = (io: Server, rooms: GameRoom[]): void => {
	// console.log(rooms);
	rooms.forEach((room, index) => {
		//if room has no clients then it gets removed
		if (room.clients.length === 0) {
			// console.log("cleaned rooms");
			rooms.splice(index, 1);
		}
	});
	//emit rooms after cleanup
	// console.log("emit after cleanup");
	emitRoomsList(io, rooms);
};

export const onRoomLeave = (socket: Socket, io: Server, rooms: GameRoom[], roomId: string, nickname: string): void => {
	const room = rooms.find((roomX) => roomX.id === roomId);
	if (room) {
		socket.leave(roomId);
		//if room state is not waiting meaning that game already started
		//we delete room completly by removing clients and calling cleanup function
		//TODO optimize maybe? this can be done without cleanup
		if (room.gameState !== GameStage.WAITING) {
			io.to(roomId).emit("enemyLeft", "Your enemy left the game :/");

			room.clients = [];
			cleanupRooms(io, rooms);
			return;
		}

		room.clients = room.clients.filter((client) => client.id !== socket.id);

		//if 0 clients left this will remove room

		if (room.clients.length === 0) {
			cleanupRooms(io, rooms);
			return;
		}

		//if room wasnt deleted by cleanup() - emit message and reset readyCheck
		if (room && room.clients.length !== 0) {
			room.clients[0].readiness = false;

			//if host left, change host
			if (room.clients[0].nickname !== room.hostName) {
				room.hostName = room.clients[0].nickname;
			}

			const someoneLeft = {
				updatedRoom: room,
				idOfUserThatLeft: socket.id,
			};

			io.to(roomId).emit("someoneLeft", someoneLeft, nickname);
		}

		// console.log("someone left room");
	}
};

export function setupRoomEvents(io: Server, rooms: GameRoom[], emptyMatrix: matrix) {
	io.on("connection", (socket) => {
		socket.on(
			"createRoom",
			({ roomName, hostName, hasPassword, password, id }: GameRoom, nickname: string, user_id: number) => {
				// Check if the room already exists
				const existingRoom = rooms.find((room) => room.id === id);
				if (existingRoom) {
					socket.emit("roomError", "A room with the same ID already exists.");
					return;
				}

				const newRoom: GameRoom = {
					id: id,
					roomName: roomName,
					hostName: hostName,
					clients: [
						{
							id: socket.id,
							nickname: nickname,
							board: emptyMatrix,
							readiness: false,
							user_id: user_id,
						},
					],
					gameState: GameStage.WAITING,

					hasPassword: hasPassword,
					password: password,
				};

				rooms.push(newRoom);

				socket.join(id);

				// console.log("room has been created");
				socket.emit("createdAndJoined", newRoom, socket.id);

				// console.log("emit after creation");
				emitRoomsList(io, rooms);
			}
		);

		socket.on("findRoom", (roomId: string) => {
			const room = rooms.find((r) => r.id === roomId);

			if (!room) {
				socket.emit("roomError", "Room that you tried to join no longer exists");
				return;
			}

			if (room.clients.length >= 2) {
				socket.emit("roomError", "Room that you tried to join is full");
				return;
			}

			socket.emit("roomFound", room);
		});

		socket.on(
			"joinRoom",
			(roomId: string, nickname: string, password: string, user_id: number, emitRooms: boolean = true) => {
				// console.log("---- join rooom ----");
				// console.log(roomId);
				// console.log(nickname);
				// console.log(password);
				// console.log(user_id);
				// console.log(emitRooms);

				const room = rooms.find((r) => r.id === roomId);
				if (!room) {
					socket.emit("roomError", "Room does not exist.");
					return;
				}

				if (room.clients.length >= 2) {
					socket.emit("roomError", "Room is full.");
					return;
				}

				if (room.hasPassword) {
					if (room.password !== password) {
						// console.log("wrong password");
						return;
					}
				}

				// Join the room
				// console.log("joined into room");
				socket.join(roomId);

				const newClient: Client = {
					id: socket.id,
					nickname: nickname,
					board: emptyMatrix,
					readiness: false,
					user_id: user_id,
				};

				room.clients.push(newClient);

				socket.emit("roomJoined", room, socket.id);

				io.to(roomId).emit("someoneJoined", room, nickname);

				// console.log("emit after joining room");
				// console.log(room.clients);
				if (emitRooms) emitRoomsList(io, rooms);
			}
		);

		socket.on("leaveRoom", (roomId: string, nickname: string) => {
			onRoomLeave(socket, io, rooms, roomId, nickname);
		});

		socket.on("getRooms", () => {
			emitRoomsList(io, rooms);
		});
	});
}
