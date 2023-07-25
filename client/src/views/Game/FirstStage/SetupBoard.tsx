import React, { Dispatch, SetStateAction } from 'react'
import SetupCell from './SetupCell'

type Props = {
    board: number[][]
    setBoard: Dispatch<SetStateAction<number[][]>>,
}

const SetupBoard = ({board, setBoard}: Props) => {
    return (
        <div className="setupboard">
            {board.map((row, rowIdx) => (
                row.map((cell, columnIdx) => (
                    <SetupCell rowIdx={rowIdx} cellIdx={columnIdx} board={board} value={cell} setBoard={setBoard}/>
                ))
            ))}
        </div>
    )
}

export default SetupBoard