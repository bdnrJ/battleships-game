import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import Board from "./Board";
import Ship from "./Ship";
import socket from "../utils/socket";
import { RoomContext } from "../context/RoomContext";

type Props = {
	board: number[][];
	setBoard: Dispatch<SetStateAction<number[][]>>;
};

export enum ShipType {
	CARRIER = 4,
	BATTLESHIP = 3,
	CRUISER = 2,
	DESTROYER = 1,
}

export const ShipTypeConst = {
	CARRIER: "Carrier",
	BATTLESHIP: "Battleship",
	CRUISER: "Cruiser",
	DESTROYER: "Destroyer",
};

const ShipPlacement = ({ board, setBoard }: Props) => {
	const [isFlipped, setIsFlipped] = useState<boolean>(false);
	const [shipsCounter, setShipsCounter] = useState<number[]>([4, 3, 2, 1]);
	const { room } = useContext(RoomContext);

	const temp1 = [
		[0, 0, 0, 0, 0, 0, 4, 4, 4, 4],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 3, 3, 3],
		[0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 3, 3, 3],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 2, 2, 0, 0, 0, 2, 2],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 1, 0, 0, 2, 2],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	];

	const temp2 = [
		[4, 4, 4, 4, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[3, 3, 3, 0, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 1, 0, 1, 0, 0, 0, 3, 3, 3],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[2, 2, 0, 0, 0, 2, 2, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 2, 2],
		[0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	];

	useEffect(() => {
		if (board.reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0) === 50) {
			socket.emit("sendPlayerBoard", board, room.id);
		}
	}, [board]);

	const handleBoardReset = () => {
		setBoard([
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

		setShipsCounter([4, 3, 2, 1]);
	};

	function getRandomInt(max: number): number {
		return Math.floor(Math.random() * Math.floor(max));
	}

	function isCellAvailable(row, col, board) {
		const rows = board.length;
		const cols = board[0].length;

		// Check if the cell is within the matrix boundaries
		if (row >= 0 && row < rows && col >= 0 && col < cols) {
			// Check if the cell is already occupied by a ship or is adjacent to another ship
			if ([1, 2, 3, 4].includes(board[row][col])) {
				return false;
			}

			// Check neighboring cells
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					const newRow = row + i;
					const newCol = col + j;

					if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
						if ([1, 2, 3, 4].includes(board[newRow][newCol])) {
							return false;
						}
					}
				}
			}

			return true;
		}

		return false;
	}

	function randomizeShipPlacement(shipLength, board) {
		const isHorizontal = Math.random() < 0.5;
		let row, col;

		if (isHorizontal) {
			row = getRandomInt(10);
			col = getRandomInt(10 - shipLength);
		} else {
			row = getRandomInt(10 - shipLength);
			col = getRandomInt(10);
		}

		// Check if the cells are available and not adjacent to other ships
		for (let i = 0; i < shipLength; i++) {
			if (!isCellAvailable(row + (isHorizontal ? 0 : i), col + (isHorizontal ? i : 0), board)) {
				// If any cell is occupied or adjacent to another ship, rerun the placement logic
				return randomizeShipPlacement(shipLength, board);
			}
		}

		// Place the ship on the board
		for (let i = 0; i < shipLength; i++) {
			board[row + (isHorizontal ? 0 : i)][col + (isHorizontal ? i : 0)] = shipLength;
		}

		return board;
	}

	const handleRandomPlacement = () => {
		let newBoard = [
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
		];

		// Randomly place ships on the board
		newBoard = randomizeShipPlacement(ShipType.CARRIER, newBoard);
		newBoard = randomizeShipPlacement(ShipType.BATTLESHIP, newBoard);
		newBoard = randomizeShipPlacement(ShipType.BATTLESHIP, newBoard);
		newBoard = randomizeShipPlacement(ShipType.CRUISER, newBoard);
		newBoard = randomizeShipPlacement(ShipType.CRUISER, newBoard);
		newBoard = randomizeShipPlacement(ShipType.CRUISER, newBoard);
		newBoard = randomizeShipPlacement(ShipType.DESTROYER, newBoard);
		newBoard = randomizeShipPlacement(ShipType.DESTROYER, newBoard);
		newBoard = randomizeShipPlacement(ShipType.DESTROYER, newBoard);
		newBoard = randomizeShipPlacement(ShipType.DESTROYER, newBoard);

		for (let i = 0; i < 10; i++) {
			console.log(newBoard[i]);
		}

		setBoard(newBoard);
		setShipsCounter([0, 0, 0, 0]); // No more ships available after random placement
	};

	return (
		<div className='game'>
			<div className='game__left'>
				<div className='game--board'>
					<Board
						setShipsCounter={setShipsCounter}
						shipsCounter={shipsCounter}
						isFlipped={isFlipped}
						boardState={board}
						setBoardState={setBoard}
					/>
				</div>
				<div className='game--ships'>
					<div className='game--ships--wrapper'>
						{shipsCounter[3] > 0 && <Ship shipType={ShipType.CARRIER} isFlipped={isFlipped} shipDndType={"Carrier"} />}
						{shipsCounter[2] > 0 && (
							<Ship shipType={ShipType.BATTLESHIP} isFlipped={isFlipped} shipDndType={"Battleship"} />
						)}
						{shipsCounter[1] > 0 && <Ship shipType={ShipType.CRUISER} isFlipped={isFlipped} shipDndType={"Cruiser"} />}
						{shipsCounter[0] > 0 && (
							<Ship shipType={ShipType.DESTROYER} isFlipped={isFlipped} shipDndType={"Destroyer"} />
						)}
					</div>
				</div>
			</div>
			<div className='game--buttons'>
				<button onClick={() => setIsFlipped(!isFlipped)}>Flip ships</button>
				<button
					onClick={() => console.log(board.reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0))}
				>
					sum
				</button>
				<button onClick={() => setBoard(temp1)}>place1</button>
				<button onClick={() => setBoard(temp2)}>place2</button>
				<button onClick={handleBoardReset}>Reset board</button>
				<button onClick={handleRandomPlacement}>Randomly Place Ships</button>
			</div>
		</div>
	);
};

export default ShipPlacement;
