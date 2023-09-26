import React, { SetStateAction } from "react";
import Cell from "./Cell";

type Props = {
	boardState: number[][];
	setBoardState: React.Dispatch<SetStateAction<number[][]>>;
	setShipsCounter: React.Dispatch<SetStateAction<number[]>>;
	isFlipped: boolean;
	shipsCounter: number[];
};

const Board = ({ boardState, setBoardState, isFlipped, setShipsCounter, shipsCounter }: Props) => {
	return (
		<div className='board' id={"boardid"}>
			{boardState.map((row, rowIdx) =>
				row.map((cell, columnIdx) => (
					<Cell
						key={parseInt(rowIdx.toString() + columnIdx)}
						shipsCounter={shipsCounter}
						setShipsCounter={setShipsCounter}
						isFlipped={isFlipped}
						setBoardState={setBoardState}
						columnId={columnIdx}
						rowId={rowIdx}
						board={boardState}
						id={parseInt(rowIdx.toString() + columnIdx)}
					/>
				))
			)}
		</div>
	);
};

export default Board;
