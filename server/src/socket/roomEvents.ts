import { Server } from "socket.io";
import { Client, GameRoom, GameStage, matrix } from "./types.js";

export function setupRoomEvents(io: Server, rooms: GameRoom[], connectedPlayers: number, emptyMatrix: matrix) {

	const emitRoomsList = (): void => {
		io.emit("roomsList", rooms);
		console.log(rooms);
		console.log("emitted rooms");
	};

	const cleanupRooms = (): void => {
		rooms.forEach((room, index) => {
			//if room has no clients then it gets removed
			if (room.clients.length === 0) {
				console.log("cleaned rooms");
				rooms.splice(index, 1);
			}
		});
		//emit rooms after cleanup
		emitRoomsList();
	};

	io.on("connection", (socket) => {

    const onRoomLeave = (roomId: string, nickname: string): void => {
			const room = rooms.find((roomX) => roomX.id === roomId);
			if (room) {
				socket.leave(roomId);
				//if room state is not waiting meaning that game already started
				//we delete room completly by removing clients and calling cleanup function
				//TODO optimize maybe? this can be done without cleanup
				if (room.gameState !== GameStage.WAITING) {
					io.to(roomId).emit("enemyLeft", "Your enemy left the game :/");

					room.clients = [];
					cleanupRooms();
					return;
				}

				room.clients = room.clients.filter((client) => client.id !== socket.id);

				//if 0 clients left this will remove room
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
				console.log("someone left room");
			}
		};

    socket.on("createRoom", ({ roomName, hostName, hasPassword, password, id }: GameRoom, nickname: string) => {
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
					},
				],
				gameState: GameStage.WAITING,

				hasPassword: hasPassword,
				password: password,
			};

			rooms.push(newRoom);

			socket.join(id);

			console.log("room has been created");
			socket.emit("createdAndJoined", newRoom, socket.id);
			emitRoomsList();
		});

		socket.on("joinRoom", (roomId: string, nickname: string, password: string, emitRooms: boolean = true) => {
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
					console.log("wrong password");
					return;
				}
			}

			// Join the room
			console.log("joined into room");
			socket.join(roomId);

			const newClient: Client = {
				id: socket.id,
				nickname: nickname,
				board: emptyMatrix,
				readiness: false,
			};

			room.clients.push(newClient);

			socket.emit("roomJoined", room, socket.id);

			io.to(roomId).emit("someoneJoined", room, nickname);

			if (emitRooms) emitRoomsList();
		});

		socket.on("leaveRoom", (roomId: string, nickname: string) => {
			onRoomLeave(roomId, nickname);
		});

		socket.on("getRooms", () => {
			emitRoomsList();
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
					onRoomLeave(room.id, room.clients[clientIdx].nickname);
					room.clients.splice(clientIdx, 1);
				}
			});

			//Remove empty rooms
			cleanupRooms();
		});

  });
}
