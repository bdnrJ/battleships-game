import { Server } from "socket.io";
import { createServer, Server as HttpServer } from "http";
import { Express } from "express";

type matrix = number[][];

enum GameStage {
	WAITING = 0,
	PLACEMENT = 1,
	PLAYING = 2,
}

enum ShipTypes {
	DESTROYER = 1,
	CRUISER = 2,
	BATTLESHIP = 3,
	CARRIER = 4,
}

enum CellType {
	NORMAL = 0,
	HIT = 1,
	DAMAGED = 2,
	DEAD = 3,
	AROUNDDEAD = 4,
}

type gameplayState = {
	roomId: string;
	player1: string;
	player1Board: matrix;
	player2: string;
	player2Board: matrix;
	turn: string;
};

interface Client {
	id: string;
	nickname: string;
	board: matrix;
	readiness: boolean;
}

interface GameRoom {
	id: string;
	roomName: string;
	hostName: string;

	clients: Client[];

	gameState: number;

	hasPassword: boolean;
	password: string;
}

export default function setupSocketIO(app: Express) {
	const httpServer: HttpServer = createServer(app);
	const io: Server = new Server(httpServer, {
		cors: {
			origin: "*",
			// origin: allowedOrigins,
			methods: ["GET", "POST"],
		},
	});

	const rooms: GameRoom[] = [];
	const gamePlayBoards: gameplayState[] = [];
	const emptyMatrix: matrix = Array.from({ length: 10 }, () => Array(10).fill(0));

	//offsets are used to determine whether a ship that has been hit is merely damaged or if it has been completely sunk
	const offsets = [
		[-1, -1],
		[1, 1],
		[-1, 1],
		[1, -1],
		[0, -1],
		/* cell */ [0, 1],
		[1, 0],
		[-1, 0],
	];

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
		console.log(`New client connected: ${socket.id}`);

		const onRoomLeave = (roomId: string, nickname: string): void => {
			const room = rooms.find((roomX) => roomX.id === roomId);
			if (room) {
				//if room state is not waiting meaning that game already started
				//we delete room completly by removing clients and calling cleanup function
				//TODO optimize maybe? this can be done without cleanup
				if (room.gameState !== GameStage.WAITING) {
					room.clients = [];
					cleanupRooms();

					//TODO message that room is being deleted
					return;
				}


				room.clients = room.clients.filter((client) => client.id !== socket.id);

				//if 0 clients left this will remove room
				cleanupRooms();

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

		socket.on("disconnect", () => {
			console.log(`Client disconnected: ${socket.id}`);
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

		//room systems

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

		socket.on("joinRoom", (roomId: string, nickname: string, password: string) => {
			const room = rooms.find((r) => r.id === roomId);
			if (!room) {
				socket.emit("roomError", "Room does not exist.");
				return;
			}

			if (room.clients.length >= 2) {
				socket.emit("roomError", "Room is full.");
				return;
			}

			if(room.hasPassword){
				if(room.password !== password){
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

			emitRoomsList();
		});

		socket.on("leaveRoom", (roomId: string, nickname: string) => {
			onRoomLeave(roomId, nickname);
		});

		socket.on("getRooms", () => {
			emitRoomsList();
		});

		socket.on("sendMessage", (message: string, roomId: string, nickname: string) => {
			console.log("send message by " + nickname);
			io.to(roomId).emit("recieveMessage", message, nickname);
		});

		//waiting stage

		socket.on("declareReady", (roomId: string, nickname: string) => {
			console.log(`${nickname} declared ready`);
			const room = rooms.find((r) => r.id === roomId);

			if (!room) return;

			const playerIdx = room.clients.findIndex((client) => client.id === socket.id);

			room.clients[playerIdx].readiness = true;

			if (room.clients[0]?.readiness && room.clients[1]?.readiness) {
				room.gameState = GameStage.PLACEMENT;
			}
			io.to(roomId).emit("readinessChange", room);
		});

		//placement stage

		socket.on("sendPlayerBoard", (board: matrix, roomId: string) => {
			const room = rooms.find((rm) => (rm.id = roomId));

			if (!room) return;

			if (board.reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0) === 50) {
				const playerIdx = room.clients.findIndex((client) => client.id === socket.id);

				room.clients[playerIdx].board = board;

				//if both players provided finished boards
				if (
					room.clients[0].board.reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0) === 50 &&
					room.clients[1].board.reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0) === 50
				) {
					//start game
					room.gameState = GameStage.PLAYING;

					const roomWithoutBoardStates: GameRoom = { ...room };
					roomWithoutBoardStates.clients.forEach((client) => ({...client, board: []}));

					//were creating empty matrix like that because of shallow copying which
					//wasted at least 5h of debugging xd
					const gameStateBoards: gameplayState = {
						roomId: room.id,
						player1: room.clients[0].id,
						player1Board: [...emptyMatrix.map((row) => [...row])],
						player2: room.clients[1].id,
						player2Board: [...emptyMatrix.map((row) => [...row])],
						turn: Math.random() < 0.5 ? room.clients[0].id : room.clients[1].id,
					};

					gamePlayBoards.push(gameStateBoards);

					io.to(roomId).emit("startPlayingStage", roomWithoutBoardStates);
					io.to(roomId).emit("playingStageBoards", gameStateBoards);
				}
			}
		});

		const isSunken = (
			rowIdx: number,
			colIdx: number,
			enemyBoard: matrix,
			myHitBoard: matrix,
			alreadyChecked: string[]
		): boolean => {
			alreadyChecked.push(rowIdx.toString() + colIdx.toString());
			for (const [offsetRow, offsetCol] of offsets) {
				const newRow = rowIdx + offsetRow;
				const newCol = colIdx + offsetCol;

				if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
					if ([1, 2, 3, 4].includes(enemyBoard[newRow][newCol]) && myHitBoard[newRow][newCol] === CellType.NORMAL) {
						return false;
					} else if (
						myHitBoard[newRow][newCol] === CellType.DAMAGED &&
						!alreadyChecked.includes(newRow.toString() + newCol.toString())
					) {
						if (isSunken(newRow, newCol, enemyBoard, myHitBoard, alreadyChecked) === false) {
							return false;
						}
					}
				}
			}
			return true;
		};

		const onSunkenShipProcedure = (rowIdx: number, colIdx: number, enemyBoard: matrix, myHitBoard: matrix): void => {
			for (const [offsetRow, offsetCol] of offsets) {
				const newRow = rowIdx + offsetRow;
				const newCol = colIdx + offsetCol;

				if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
					if ([1, 2, 3, 4].includes(enemyBoard[newRow][newCol]) && myHitBoard[newRow][newCol] !== CellType.DEAD) {
						myHitBoard[newRow][newCol] = CellType.DEAD;

						if (enemyBoard[newRow][newCol] !== 1) {
							onSunkenShipProcedure(newRow, newCol, enemyBoard, myHitBoard);
						}
					} else {
						if (myHitBoard[newRow][newCol] === CellType.DEAD) {
							myHitBoard[newRow][newCol] = CellType.DEAD;
						} else {
							myHitBoard[newRow][newCol] = CellType.AROUNDDEAD;
						}
					}
				}
			}
		};

		//game stage

		// POOR
		//i think this stinks, each call from user needs to find user by nickname (searching an array) - i dont like this
		socket.on("missleShot", (rowIdx: number, colIdx: number, roomId: string) => {
			//finding room and gameplayState from where request is being made
			const room = rooms.find((rm) => rm.id === roomId);
			const gameplayState = gamePlayBoards.find((rm) => rm.roomId === roomId);

			//if they do not exist... it's bad
			if (!room || !gameplayState) return;

			if (gameplayState.turn !== socket.id) {
				console.log("player somehow requested move, but it is not his turn");
				return;
			}

			//gathering info which board belongs to player that makes request
			const enemyIdx = room.clients.findIndex((client) => client.id !== socket.id);
			const enemyBoard = room.clients[enemyIdx].board;
			const myShootingBoard =
				gameplayState.player1 === socket.id ? gameplayState.player1Board : gameplayState.player2Board;

			//if player shot empty field
			if (enemyBoard[rowIdx][colIdx] === CellType.NORMAL) {
				myShootingBoard[rowIdx][colIdx] = CellType.HIT;

				//set turn to the enemy player
				gameplayState.turn = room.clients[enemyIdx].id;
			}

			//if player shot not-empty field
			if (
				[ShipTypes.DESTROYER, ShipTypes.BATTLESHIP, ShipTypes.CRUISER, ShipTypes.CARRIER].includes(
					enemyBoard[rowIdx][colIdx]
				)
			) {
				myShootingBoard[rowIdx][colIdx] = CellType.DAMAGED;

				//when shot was succesfull - check if ship is dead
				if (isSunken(rowIdx, colIdx, enemyBoard, myShootingBoard, [])) {
					onSunkenShipProcedure(rowIdx, colIdx, enemyBoard, myShootingBoard);
					if (enemyBoard[rowIdx][colIdx] === ShipTypes.DESTROYER) {
						myShootingBoard[rowIdx][colIdx] = CellType.DEAD;
					}

					//check if someone won
					const sumOfDeadShips = myShootingBoard
						.flat() // Flatten the matrix
						.reduce((sum, cellValue) => {
							return sum + (cellValue === CellType.DEAD ? 1 : 0);
						}, 0);

					if (sumOfDeadShips === 20) {
						gameplayState.turn = "";
						io.to(roomId).emit("updateGameState", gameplayState, rowIdx, colIdx, socket.id);
						io.to(roomId).emit("victory", `${room.clients.filter((client) => client.id === socket.id)[0].nickname} has won!`);
						return;
					}
				}
			}

			io.to(roomId).emit("updateGameState", gameplayState, rowIdx, colIdx, socket.id);
		});
	});

	return httpServer;
}
