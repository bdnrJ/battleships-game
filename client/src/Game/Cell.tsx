import React, { useState, SetStateAction } from 'react'

type Props = {
    id: number
    board: number[][]
    rowId: number
    columnId: number
    setBoardState: React.Dispatch<SetStateAction<number[][]>>
    isFlipped: boolean,
    setShipsCounter: React.Dispatch<SetStateAction<number[]>>
    shipsCounter: number[]
}

const Cell = ({ id, board, rowId, columnId, setBoardState, isFlipped, setShipsCounter, shipsCounter }: Props) => {

    const isCellAvailable = (rowIdx: number, colIdx: number, shipLength: number, boardState: number[][], isFlipped: boolean) => {
        // Check if the cell itself is available
        if (boardState[rowIdx][colIdx] === 1) {
            return false;
        }

        // 10 x 10
        const rows = boardState.length;
        const cols = boardState[0].length;

        const offsetsxd = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1],
        ];

        const offsets = [];

        // set offsets based on the ship's length (horizontal or vertical placement)
        // (no ship can be places next to other ship)
        if (!isFlipped) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= shipLength; j++) {
                    offsets.push([i, j])
                }
            }
        } else {
            for (let i = (-shipLength); i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    offsets.push([i, j]);
                }
            }
        }

        console.log('-----');
        
        for (const [offsetRow, offsetCol] of offsets) {
            const newRow = rowIdx + offsetRow;
            const newCol = colIdx + offsetCol;

            if(newCol > 10) return false;

            if(isFlipped && newRow < -1) return false;


            console.log(`[${newRow}, ${newCol}]`);
            

            // Check if the cell is within the matrix boundaries
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                // Check if the cell is already occupied by a ship
                if ([1,2,3,4].includes(boardState[newRow][newCol])) {
                    return false;
                }
            }
        }

        return true;
    };


    const dropShip = (e: any) => {
        //the length of the ship [1 - 4] is stored as ship id
        const shipLength = document.querySelector('.beingDragged')?.id;


        if (!shipLength) {
            console.log("ship id is not defined (should not be possible)");
            return;
        }

        const shipLengthNumber = parseInt(shipLength)

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

        removeAdditionalClasses()
    }

    const dragOver = (e: any) => {
        e.preventDefault();
        const shipLength = document.querySelector('.beingDragged')?.id;

        if (!shipLength) {
            console.log("ship id - length is not defined (should not be possible)");
            return;
        }

        const isPossible = isCellAvailable(rowId, columnId, parseInt(shipLength), board, isFlipped);

        addAdditionalClasses(isPossible, shipLength);
    }

    const dragExit = (e: any) => {
        const shipLength = document.querySelector('.beingDragged')?.id;

        if (!shipLength) {
            console.log("ship id is not defined (should not be possible)");
            return;
        }

        removeAdditionalClasses();
    }

    const removeAdditionalClasses = () => {
        const allDocumentsWithErrorOrCanClass = document.querySelectorAll('.--error, .--can');
        allDocumentsWithErrorOrCanClass.forEach((elem) => { elem.classList.remove("--error"); elem.classList.remove("--can") })
    }

    const addAdditionalClasses = (isPlacementPossible: boolean, shipLength: string) => {
        //adds classes (for styling) for elements if they are affected by placement of the ship

        if (isFlipped) {
            if (!isPlacementPossible) {
                for (let i = 0; i < parseInt(shipLength); i++) {
                    document.getElementById((id - (i * 10)).toString())?.classList.add("--error");
                }
            } else {
                for (let i = 0; i < parseInt(shipLength); i++) {
                    document.getElementById((id - (i * 10)).toString())?.classList.add("--can");
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
    }


    return (
        <div className={`cell ${board[rowId][columnId] !== 0 ? "--used" : ""}`} id={id.toString()}
            onDragOver={(e) => dragOver(e)}
            onDrop={(e) => dropShip(e)}
            onDragExit={(e) => dragExit(e)}
        >
            {id}
        </div>
    )
}

export default Cell