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
	const upperMarks = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
	const leftMarks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	return (
		<div className='board--wrapper'>
			<section className='board--wrapper__uppermarks'>
				{upperMarks.map((letter) => (
					<div key={`m${letter}`} className='gameboard__marks--elem'>
						{letter}
					</div>
				))}
			</section>
			<div className='board' id={"boardid"}>
				<section className='board--leftmarks'>
					{leftMarks.map((number) => (
						<div key={`m${number}`} className='gameboard__marks--elem'>
							{number}
						</div>
					))}
				</section>
				<section className='board--placementboard'>
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
								cell={cell}
							/>
						))
					)}
				</section>
			</div>
		</div>
	);
};

export default Board;
