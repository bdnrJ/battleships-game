import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import EnemyBoard from "./EnemyBoard";
import MyBoard from "./MyBoard";
import { gameplayState } from "../../views/GameRoom";
import socket from "../../utils/socket";
import { useCenterModal } from "../../hooks/useCenterModal";
import VictoryModal from "../../components/modals/VictoryModal";

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
	const [hasGameEnded, setHasGameEnded] = useState<boolean>(false);

	const { showCenterModal, closePopup } = useCenterModal();

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

	const [myEnemyBoardHitLog, setMyEnemyBoardHitLog] = useState<number[][]>([
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

		socket.on("victory", (victoryMessage: string, userId: string) => {
			setHasGameEnded(true);
			showCenterModal(<VictoryModal userId={userId} victoryMessage={victoryMessage} closePopup={closePopup} />);
		});

		setInterval(() => {
			//in prod will work correctly ;d
			setPlayerTimer((prevTimer) => prevTimer - 1);
		}, 1000);

		return () => {
			socket.off("updateGameState");
			socket.off("victory");
		};
	}, []);

	useEffect(() => {
		//if player run out of time, bot makes a move //TODO to change
		if (playerTimer <= 0) {
			//find empty cell
			if (gameplayStageRoom.turn === user.sessionId) {
				let cords = [-1, -1];
				for (let row = 0; row < 10; row++) {
					if (cords[0] !== -1) break;
					for (let col = 0; col < 10; col++) {
						if (enemyBoard[row][col] === 0) {
							cords = [row, col];
							break;
						}
					}
				}

				socket.emit("missleShot", cords[0], cords[1], gameplayStageRoom.roomId);
			}
		}
	}, [playerTimer]);

	return (
		<div className='gameplay'>
			{!hasGameEnded && (
				<>
					{gameplayStageRoom.turn === user.sessionId ? (
						<span className='gameplay__your-turn'>
							<p>Your </p>turn
						</span>
					) : (
						<span className='gameplay__enemy-turn'>
							<p>Enemy </p>turn
						</span>
					)}
					<h3>Time left: {playerTimer}</h3>
				</>
			)}
			<div className='gameplay__boards'>
				<div className='gameplay__player'>
					<div className='gameplay__player--title'>You</div>
					<MyBoard myBoard={myBoard} hitLogBoard={myBoardHitLog} />
				</div>
				<div className='gameplay__player'>
					<div className='gameplay__player--title'>{enemyNickname}</div>
					<EnemyBoard
						enemyBoard={enemyBoard}
						gameplayStageRoom={gameplayStageRoom}
						myEnemyBoardHitLog={myEnemyBoardHitLog}
						setMyEnemyBoardHitLog={setMyEnemyBoardHitLog}
					/>
				</div>
			</div>
		</div>
	);
};

export default GamePlay;
