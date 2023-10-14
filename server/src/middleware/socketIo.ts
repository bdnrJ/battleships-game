import { Server } from "socket.io";
import { createServer, Server as HttpServer } from "http";
import { Express } from "express";
import { GameRoom, matrix, gameplayState, WaitingRoom } from "../socket/types.js";
import { setupRoomEvents } from "../socket/roomEvents.js";
import { setupUtilEvents } from "../socket/utilEvents.js";
import { setupChatEvents } from "../socket/chatEvents.js";
import { setupGameplayEvents } from "../socket/games_stage_events/gameplayStageEvents.js";
import { setupWaitingListEvents } from "../socket/waitingListEvents.js";
import { setupPlacementStageEvents } from "../socket/games_stage_events/placementStageEvents.js";
import { setupWaitingStageEvents } from "../socket/games_stage_events/waitingStageEvents.js";

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
	let connectedPlayers: number = 0;
	const gamePlayBoards: gameplayState[] = [];
	const emptyMatrix: matrix = Array.from({ length: 10 }, () => Array(10).fill(0));
	const playersWaitingRoom: WaitingRoom = {
		id: "GlobalWaitingRoom",
		waitingList: [],
	};

	//offsets are used to determine whether a ship that has been hit is merely damaged or if it has been completely sunk

	setupRoomEvents(io, rooms, connectedPlayers, emptyMatrix);

	setupUtilEvents(io, connectedPlayers);

	setupChatEvents(io);

	setupWaitingListEvents(io, playersWaitingRoom, rooms);

	//gameplay
	setupWaitingStageEvents(io, rooms);
	setupPlacementStageEvents(io, rooms, emptyMatrix, gamePlayBoards);
	setupGameplayEvents(io, rooms, gamePlayBoards);

	return httpServer;
}
