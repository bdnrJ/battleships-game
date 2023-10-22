import { Server } from "socket.io";
import { GameRoom, GameStage, gameplayState, matrix } from "../types.js";

export function setupPlacementStageEvents(
	io: Server,
	rooms: GameRoom[],
	emptyMatrix: matrix,
	gamePlayBoards: gameplayState[]
) {
	io.on("connection", (socket) => {
		socket.on("sendPlayerBoard", (board: matrix, roomId: string) => {
			const room = rooms.find((rm) => rm.id === roomId);

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
					roomWithoutBoardStates.clients.forEach((client) => ({ ...client, board: [] }));

					//were creating empty matrix like that because of shallow copying which
					//wasted at least 5h of debugging xd
					const gameStateBoards: gameplayState = {
						roomId: room.id,
						player1: room.clients[0].id,
						player1Board: [...emptyMatrix.map((row) => [...row])],
						player1_id: room.clients[0].user_id,
						player2: room.clients[1].id,
						player2Board: [...emptyMatrix.map((row) => [...row])],
						player2_id: room.clients[1].user_id,
						turn: Math.random() < 0.5 ? room.clients[0].id : room.clients[1].id,
					};

					gamePlayBoards.push(gameStateBoards);

					io.to(roomId).emit("startPlayingStage", roomWithoutBoardStates, gameStateBoards);
				}
			}
		});
	});
}
