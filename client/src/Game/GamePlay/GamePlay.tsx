import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import EnemyBoard from "./EnemyBoard";
import MyBoard from "./MyBoard";
import { gameplayState } from "../../views/GameRoom";
import socket from "../../utils/socket";

type Props = {
	myBoard: number[][];
	setMyBoard: Dispatch<SetStateAction<number[][]>>;
	nicknames: string[];
	gameplayStageRoom: gameplayState;
	setGameplayStageRoom: Dispatch<SetStateAction<gameplayState>>;
};

export enum CellType {
	NORMAL = 0,
	HIT = 1,
	DAMAGED = 2,
	DEAD = 3,
	AROUNDDEAD = 4,
}

const GamePlay = ({ myBoard, setMyBoard, nicknames, gameplayStageRoom, setGameplayStageRoom }: Props) => {
	const [enemyBoard, setEnemyBoard] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));
	const { user } = useContext(UserContext);
	const enemyNickname = nicknames.find((nickname) => nickname !== user.nickname) || "unknown";
	const [playerTimer, setPlayerTimer] = useState<number>(30);

	const [myBoardHitLog, setMyBoardHitLog] = useState<number[][]>([
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]);

	useEffect(() => {
		socket.on("updateGameState", (gameplayState: gameplayState, rowIdx: number, colIdx: number, playerId: string) => {
			setPlayerTimer(30);
			//updating state of myBoard and enemyBoard
			if (gameplayState.player1 === user.sessionId) {
				const newEnemyBoard = [...gameplayState.player1Board.map((row) => [...row])];
				setEnemyBoard(newEnemyBoard);

				const newEnemyViewMyBoard = [...gameplayState.player2Board.map((row) => [...row])];

				const updatedMyBoard = myBoard.map((row, rowIndex) =>
					row.map((cell, colIndex) =>
						newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DAMAGED ||
						newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DEAD
							? 6
							: cell
					)
				);

				setMyBoard(updatedMyBoard);
			} else {
				const newEnemyBoard = [...gameplayState.player2Board.map((row) => [...row])];
				setEnemyBoard(newEnemyBoard);

				const newEnemyViewMyBoard = [...gameplayState.player1Board.map((row) => [...row])];

				const updatedMyBoard = myBoard.map((row, rowIndex) =>
					row.map((cell, colIndex) =>
						newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DAMAGED ||
						newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DEAD
							? 6
							: cell
					)
				);

				setMyBoard(updatedMyBoard);
			}

			//keeping track of which field enemy hit
			if (playerId !== user.sessionId) {
				const newHitLog = myBoardHitLog;
				newHitLog[rowIdx][colIdx] = 1;
				setMyBoardHitLog(newHitLog);
			}

			setGameplayStageRoom({ ...gameplayState });
		});

		socket.on("victory", (victoryMessage: string) => {
			alert(victoryMessage);
		});

		setInterval(() => {
			setPlayerTimer((prevTimer) => prevTimer - 0.5);
		}, 1000);

		return () => {
			socket.off("updateGameState");
			socket.off("victory");
		};
	}, []);

	useEffect(() => {
		if (playerTimer === 0) {
            if (gameplayStageRoom.turn === user.sessionId) {
                console.log(gameplayStageRoom.turn + " is making a bot move!");
				socket.emit("missleShot", 5, 5, gameplayStageRoom.roomId);
			}
		}
	}, [playerTimer]);

	return (
		<div className='gameplay'>
			<span>{gameplayStageRoom.turn === user.sessionId ? "Your turn" : "Enemy turn"}</span>
			<h3>Time left: {playerTimer}</h3>
			<div className='gameplay__boards'>
				<div className='gameplay__player'>
					<div className='gameplay__player--title'>You</div>
					<MyBoard myBoard={myBoard} hitLogBoard={myBoardHitLog} />
				</div>
				<div className='gameplay__player'>
					<div className='gameplay__player--title'>{enemyNickname}</div>
					<EnemyBoard enemyBoard={enemyBoard} gameplayStageRoom={gameplayStageRoom} />
				</div>
			</div>
		</div>
	);
};

export default GamePlay;
