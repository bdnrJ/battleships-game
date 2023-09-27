import { ShipType, ShipTypeConst } from "./ShipPlacement";
import React, { SetStateAction, useEffect } from "react";
import { useDrop } from "react-dnd";

type Props = {
	id: number;
	board: number[][];
	rowId: number;
	columnId: number;
	setBoardState: React.Dispatch<SetStateAction<number[][]>>;
	isFlipped: boolean;
	setShipsCounter: React.Dispatch<SetStateAction<number[]>>;
	shipsCounter: number[];
};

const Cell = ({ id, board, rowId, columnId, setBoardState, isFlipped, setShipsCounter, shipsCounter }: Props) => {
	const isCellAvailable = (
		rowIdx: number,
		colIdx: number,
		shipLength: number,
		boardState: number[][],
		isFlipped: boolean
	) => {
		// Check if the cell itself is available
		if (boardState[rowIdx][colIdx] !== 0) {
			return false;
		}

		// 10 x 10
		const rows = boardState.length;
		const cols = boardState[0].length;

		const offsets = [];

		// set offsets based on the ship's length (horizontal or vertical placement)
		// (no ship can be places next to other ship)
		if (!isFlipped) {
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= shipLength; j++) {
					offsets.push([i, j]);
				}
			}
		} else {
			for (let i = -shipLength; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					offsets.push([i, j]);
				}
			}
		}

		//check every offset for colision or out of border
		for (const [offsetRow, offsetCol] of offsets) {
			const newRow = rowIdx + offsetRow;
			const newCol = colIdx + offsetCol;

			if (newCol > 10) return false;

			if (isFlipped && newRow < -1) return false;

			// Check if the cell is within the matrix boundaries
			if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
				// Check if the cell is already occupied by a ship
				if ([1, 2, 3, 4].includes(boardState[newRow][newCol])) {
					return false;
				}
			}
		}

		return true;
	};

	const dropShip = () => {
		//the length of the ship [1 - 4] is stored as ship id
		const shipLength = document.querySelector(".beingDragged")?.id;

		if (!shipLength) {
			throw Error("ship id is not defined - seems like something else is being dragged which should not be possible");
		}

		const shipLengthNumber = parseInt(shipLength);

		const isPossible = isCellAvailable(rowId, columnId, shipLengthNumber, board, isFlipped);

		if (isPossible) {
			if (isFlipped) {
				const newBoard = board.map((row, rowIndex) =>
					rowIndex <= rowId && rowIndex > rowId - shipLengthNumber
						? row.map((cell, cellIndex) => {
								if (cellIndex === columnId) {
									return shipLengthNumber; // Update the cell at the specified column to 1
								} else {
									return cell; // Keep other cells unchanged
								}
						  })
						: row
				);
				setBoardState(newBoard); // Update the state with the newBoard
			} else {
				const newBoard = board.map((row, rowIndex) =>
					rowIndex === rowId
						? row.map((cell, cellIndex) => {
								if (cellIndex >= columnId && cellIndex < columnId + shipLengthNumber) {
									return shipLengthNumber; // Update the cells within the ship's length to 1
								} else {
									return cell; // Keep other cells unchanged
								}
						  })
						: row
				);
				setBoardState(newBoard); // Update the state with the newBoard
			}
			const newShipsCounter = [...shipsCounter];
			newShipsCounter[parseInt(shipLength) - 1] -= 1;
			setShipsCounter(newShipsCounter);
		}

		removeAdditionalClasses();
	};

	// const dragOver = (e: any) => {
	// 	e.preventDefault();
	// 	const shipLength = document.querySelector(".beingDragged")?.id;

	// 	if (!shipLength) {
	// 		alert("ship id - length is not defined (should not be possible)");
	// 		return;
	// 	}

	// 	const isPossible = isCellAvailable(rowId, columnId, parseInt(shipLength), board, isFlipped);

	// 	addAdditionalClasses(isPossible, shipLength);
	// };

	// const dragExit = () => {
	// 	const shipLength = document.querySelector(".beingDragged")?.id;

	// 	if (!shipLength) {
	// 		alert("ship id is not defined (should not be possible)");
	// 		return;
	// 	}

	// 	removeAdditionalClasses();
	// };

	const removeAdditionalClasses = () => {
		const allDocumentsWithErrorOrCanClass = document.querySelectorAll(".--error, .--can");
		allDocumentsWithErrorOrCanClass.forEach((elem) => {
			elem.classList.remove("--error");
			elem.classList.remove("--can");
		});
	};

	const addAdditionalClasses = (isPlacementPossible: boolean, shipLength: string) => {
		//adds classes (for styling) for elements if they are affected by placement of the ship
		removeAdditionalClasses();

		if (isFlipped) {
			if (!isPlacementPossible) {
				for (let i = 0; i < parseInt(shipLength); i++) {
					document.getElementById((id - i * 10).toString())?.classList.add("--error");
				}
			} else {
				for (let i = 0; i < parseInt(shipLength); i++) {
					document.getElementById((id - i * 10).toString())?.classList.add("--can");
				}
			}
		} else {
			if (!isPlacementPossible) {
				for (let i = 0; i < parseInt(shipLength); i++) {
					if ((id + i) / 10 < Math.ceil(id / 10) || [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].includes(id))
						document.getElementById((id + i).toString())?.classList.add("--error");
				}
			} else {
				for (let i = 0; i < parseInt(shipLength); i++) {
					if ((id + i) / 10 < Math.ceil(id / 10) || [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].includes(id))
						document.getElementById((id + i).toString())?.classList.add("--can");
				}
			}
		}
	};

	const [{ isOver }, drop] = useDrop(
		() => ({
			accept: ShipTypeConst.BATTLESHIP || ShipTypeConst.CARRIER || ShipTypeConst.CRUISER || ShipTypeConst.DESTROYER,
			drop: () => dropShip(),
			collect: (monitor) => ({
				isOver: !!monitor.isOver(),
			}),
		}),
		[board]
	);

	//creates green or red squares when user hovers over board with a ship
	useEffect(() => {
		if (isOver) {
			const shipLength = document.querySelector(".beingDragged")?.id;
			if (!shipLength) return;
			const isPlacementPossible = isCellAvailable(rowId, columnId, parseInt(shipLength), board, isFlipped);
			addAdditionalClasses(isPlacementPossible, shipLength.toString());
		}
	}, [isOver]);

	//removes green or red squares if user lets go of ship outside board
	// useEffect(() => {
	// 	const handleMouseOut = (e: MouseEvent) => {
	// 		console.log("Mouse out event triggered.");
	// 		const boardElement = document.getElementById("boardid"); // Replace with the actual ID of your board element
	// 		if (boardElement && !boardElement.contains(e.relatedTarget as Node)) {
	// 			removeAdditionalClasses();
	// 		}
	// 	};

	// 	const handleTouchEnd = (e: TouchEvent) => {
	// 		console.log("Touch end event triggered.");
	// 		const boardElement = document.getElementById("boardid"); // Replace with the actual ID of your board element
	// 		if (boardElement && !boardElement.contains(e.target as Node)) {
	// 			removeAdditionalClasses();
	// 		}
	// 	};

	// 	window.addEventListener("touchend", handleTouchEnd);
	// 	window.addEventListener("mouseout", handleMouseOut);

	// 	return () => {
	// 		window.removeEventListener("mouseout", handleMouseOut);
	// 		window.removeEventListener("touchend", handleTouchEnd);
	// 	};
	// }, []);

	return (
		<div
			className={`cell ${
				board[rowId][columnId] === ShipType.DESTROYER
					? "--destroyer"
					: board[rowId][columnId] === ShipType.CRUISER
					? "--cruiser"
					: board[rowId][columnId] === ShipType.BATTLESHIP
					? "--battleship"
					: board[rowId][columnId] === ShipType.CARRIER
					? "--carrier"
					: ""
			}`}
			id={id.toString()}
			ref={drop}
		></div>
	);
};

export default Cell;
