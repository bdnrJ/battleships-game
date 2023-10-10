import EnemyCell from "./EnemyCell";
import { gameplayState } from "../../views/GameRoom";
import { v4 } from "uuid";
import { SetStateAction } from "react";

type Props = {
	enemyBoard: number[][];
	gameplayStageRoom: gameplayState;
	setMyEnemyBoardHitLog: React.Dispatch<SetStateAction<number[][]>>;
	myEnemyBoardHitLog: number[][];
};

const EnemyBoard = ({ enemyBoard, gameplayStageRoom, myEnemyBoardHitLog, setMyEnemyBoardHitLog }: Props) => {
	const upperMarks = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
	const leftMarks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	return (
		<div className='gameboard'>
			<div className='gameboard--boardwrapper'>
				<div className='gameboard--uppermarks'>
					{upperMarks.map((letter) => (
						<div key={`m${letter}`} className='gameboard__marks--elem'>
							{letter}
						</div>
					))}
				</div>
				<div className='gameboard__rest'>
					<div className='gameboard--leftmarks'>
						{leftMarks.map((number) => (
							<div key={`m${number}`} className='gameboard__marks--elem'>
								{number}
							</div>
						))}
					</div>
					<div className='gameboard__board'>
						{enemyBoard.map((row, rowIdx) =>
							row.map((cell, columnIdx) => (
								<EnemyCell
									key={v4()}
									value={cell}
									rowIdx={rowIdx}
									colIdx={columnIdx}
									turn={gameplayStageRoom.turn}
									wasHit={myEnemyBoardHitLog[rowIdx][columnIdx] !== 0}
                                    setMyEnemyBoardHitLog={setMyEnemyBoardHitLog}
								/>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default EnemyBoard;
