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

    const isPlacementPossible = (shipLength: string) => {
        if (isFlipped) {
            console.log("1");

            if ((rowId - parseInt(shipLength)) < -1) {
                return false;
            }

            //check if trying to place a ship on already occupied place, or out of borders
            for (let i = 0; i < parseInt(shipLength); i++) {
                if (document.getElementById((id - (i * 10)).toString())?.classList.contains("--used"))
                    return false;
            }
        } else {
            //if ship is tried to be placed out of board borders
            if ((columnId + parseInt(shipLength)) > 10) {
                return false;
            }

            //check if trying to place a ship on already occupied place, or out of borders
            for (let i = 0; i < parseInt(shipLength); i++) {
                if ((id + i) / 10 < Math.ceil(id / 10) || [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].includes(id))
                    if (document.getElementById((id + i).toString())?.classList.contains("--used"))
                        return false;
            }
        }

        return true;
    }

    const dropShip = (e: any) => {
        //the length of the ship [1 - 4] is stored as ship id
        const shipLength = document.querySelector('.beingDragged')?.id;

        if (!shipLength) {
            console.log("ship id is not defined (should not be possible)");
            return;
        }

        const isPossible = isPlacementPossible(shipLength);

        if (isPossible) {
            if (isFlipped) {
                const newBoard = board.map((row, rowIndex) =>
                    rowIndex <= rowId && rowIndex > rowId - parseInt(shipLength)
                        ? row.map((cell, cellIndex) => {
                            if (cellIndex === columnId) {
                                return 1; // Update the cell at the specified column to 1
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
                            if (cellIndex >= columnId && cellIndex < columnId + parseInt(shipLength)) {
                                return 1; // Update the cells within the ship's length to 1
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

        let isPossible = isPlacementPossible(shipLength);

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