import React, { useState, Dispatch, SetStateAction } from 'react'


type Props = {
    rowIdx: number,
    cellIdx: number
    board: number[][]
    value: number
    setBoard: Dispatch<SetStateAction<number[][]>>,

}

const SetupCell = ({ rowIdx, cellIdx, board, value, setBoard }: Props) => {
    const [isAbove, setIsAbove] = useState(false);
    const [isDropped, setIsDropped] = useState(false);
    const [error, setError] = useState(false);

    const onDragEnter = (e: any) => {
        let event = e as Event;
        event.stopPropagation();
        event.preventDefault();

        isDropped ? setError(true) : setIsAbove(true);
    }

    const onDragLeave = (e: any) => {
        let event = e as Event;
        event.stopPropagation();

        setIsAbove(false);
        setError(false);
    }

    const onDrop = (e: any) => {
        let event = e as Event;
        event.stopPropagation();

        setIsDropped(true);
        setError(false);
        setIsAbove(false);

        const newBoard = board.map((row, rowIndex) =>
            rowIndex === rowIdx ? row.map((cell, cellIndex) => (cellIndex === cellIdx ? 1 : cell)) : row
        );

        setBoard(newBoard);

    }

    return (
        <div
            className={`setupcell ${isAbove ? "--active" : ""} ${isDropped ? "--dropped" : ""} ${error ? "--error" : ""} `}
            onDragOver={(e) => onDragEnter(e)}
            onDragLeave={(e) => onDragLeave(e)}
            onDrop={(e) => onDrop(e)}
        >
            {rowIdx.toString() + cellIdx + " " + value}
        </div>
    )
}

export default SetupCell