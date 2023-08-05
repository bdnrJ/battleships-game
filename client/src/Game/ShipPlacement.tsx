import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import Board from './Board';
import Ship from './Ship';
import socket from '../utils/socket';
import { UserContext } from '../context/UserContext';
import { RoomContext } from '../context/RoomContext';

type Props = {
    board: number[][],
    setBoard: Dispatch<SetStateAction<number[][]>>
}

enum CellType {
    EMPTY = 0,
    FILLED = 1,
    HIT = 2,
    SUNKEN = 3
}

enum ShipType {
    CARRIER = 4,
    BATTLESHIP = 3,
    CRUISER = 2,
    DESTROYER = 1
}

const ShipPlacement = ({board, setBoard}: Props) => {
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [shipsCounter, setShipsCounter] = useState<number[]>([4, 3, 2, 1]);
    const {user} = useContext(UserContext);
    const {room} = useContext(RoomContext);

    useEffect(() => {

        if(board.reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0) === 50){
            socket.emit('sendPlayerBoard', board, user.nickname, room.id);
        }

    }, [board])

    return (
        <div className="game">
            <div className="game--board">
                <Board setShipsCounter={setShipsCounter} shipsCounter={shipsCounter} isFlipped={isFlipped} boardState={board} setBoardState={setBoard} />
            </div>
            <div className="game--ships">
                {shipsCounter[3] > 0 && <Ship shipType={ShipType.CARRIER} isFlipped={isFlipped} />}
                {shipsCounter[2] > 0 && <Ship shipType={ShipType.BATTLESHIP} isFlipped={isFlipped} />}
                {shipsCounter[1] > 0 && <Ship shipType={ShipType.CRUISER} isFlipped={isFlipped} />}
                {shipsCounter[0] > 0 && <Ship shipType={ShipType.DESTROYER} isFlipped={isFlipped} />}

                <button onClick={() => setIsFlipped(!isFlipped)}>Flip</button>
                <button onClick={() => console.log(board)}>check</button>
                <button onClick={() => console.log(board.reduce((sum, row) => sum.concat(row)).reduce((acc, num) => acc + num, 0))}>sum</button>
            </div>
        </div>
    )
}

export default ShipPlacement