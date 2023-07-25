import React, { useState } from 'react'
import SetupBoard from './FirstStage/SetupBoard';
import FirstStage from './FirstStage/FirstStage';

const Game = () => {
    const [isSecondStage, setIsSecondStage] = useState(false);
    const [board, setBoard] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));

    return (
        <div className="game">
            {isSecondStage ? <></> : <FirstStage board={board} setBoard={setBoard} />}
        </div>
    )
}

export default Game