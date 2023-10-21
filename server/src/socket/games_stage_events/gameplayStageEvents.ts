import { Server } from "socket.io";
import { CellType, GameRoom, GameStage, ShipTypes, gameplayState, matrix } from "../types.js";
import GameModel, { Game } from "../../models/game.js";

const createGameLog = async () => {
	console.log("--- create game log ---")
	const game: Game = {
		player1_id: 1,
		player2_id: 2,
		p1_won: true,
		game_date: new Date(),
	};

	try {
		const res = await GameModel.createGame(game);
		console.log(res);
	} catch (err: any) {
		console.log(err);
	}
};

export function setupGameplayEvents(io: Server, rooms: GameRoom[], gamePlayBoards: gameplayState[]) {
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

	const isShipSunken = (
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
					if (isShipSunken(newRow, newCol, enemyBoard, myHitBoard, alreadyChecked) === false) {
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

	io.on("connection", (socket) => {
		socket.on("missleShot", (rowIdx: number, colIdx: number, roomId: string) => {
			//finding room and gameplayState from where request is being made
			const room: GameRoom | undefined = rooms.find((rm) => rm.id === roomId);
			const gameplayState: gameplayState | undefined = gamePlayBoards.find((rm) => rm.roomId === roomId);

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
				if (isShipSunken(rowIdx, colIdx, enemyBoard, myShootingBoard, [])) {
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
						room.gameState = GameStage.ENDED;
						io.to(roomId).emit("updateGameState", gameplayState, rowIdx, colIdx, socket.id);
						io.to(roomId).emit(
							"victory",
							`${room.clients.filter((client) => client.id === socket.id)[0].nickname} has won!`,
							socket.id
						);

						createGameLog();

						return;
					}
				}
			}

			io.to(roomId).emit("updateGameState", gameplayState, rowIdx, colIdx, socket.id);
		});
	});
}
