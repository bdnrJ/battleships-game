import { useContext } from "react";
import { CellType } from "./GamePlay";
import socket from "../../utils/socket";
import { UserContext } from "../../context/UserContext";
import { RoomContext } from "../../context/RoomContext";
import { SetStateAction } from "react";

type Props = {
	value: number;
	rowIdx: number;
	colIdx: number;
	turn: string;
	wasHit: boolean;
	setMyEnemyBoardHitLog: React.Dispatch<SetStateAction<number[][]>>;
};

const EnemyCell = ({ value, rowIdx, colIdx, turn, wasHit, setMyEnemyBoardHitLog }: Props) => {
	const { room } = useContext(RoomContext);
	const { user } = useContext(UserContext);

	const handleClick = () => {
		console.log(turn);
		if (value === CellType.NORMAL && user.sessionId === turn) {
			socket.emit("missleShot", rowIdx, colIdx, room.id);
			setMyEnemyBoardHitLog((prev) => {
				const updatedBoard = [...prev];
				updatedBoard[rowIdx][colIdx] = 1;
				return updatedBoard;
			});
		}
	};

	return (
		<div
			className={`enemycell 
        ${value === CellType.NORMAL && "--normal"}
        ${wasHit && "--hit"}
        ${value === CellType.DAMAGED && "--damaged"}
        ${value === CellType.DEAD && "--dead"}
        ${value === CellType.AROUNDDEAD && "--arounddead"}
    `}
			onClick={handleClick}
		>
			{/* {value} */}
		</div>
	);
};

export default EnemyCell;
