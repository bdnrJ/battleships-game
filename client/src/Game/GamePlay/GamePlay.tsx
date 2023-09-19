import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { UserContext } from "../../context/UserContext"
import EnemyBoard from "./EnemyBoard"
import MyBoard from "./MyBoard"
import { gameplayState } from "../../views/GameRoom"
import socket from "../../utils/socket"
import Cell from "../Cell"

type Props = {
    myBoard: number[][],
    setMyBoard: Dispatch<SetStateAction<number[][]>>
    nicknames: string[]
    gameplayStageRoom: gameplayState,
    setGameplayStageRoom: Dispatch<SetStateAction<gameplayState>>
}

export enum CellType {
    NORMAL = 0,
    HIT = 1,
    DAMAGED = 2,
    DEAD = 3,
    AROUNDDEAD = 4,
}

const GamePlay = ({ myBoard, setMyBoard, nicknames, gameplayStageRoom, setGameplayStageRoom }: Props) => {
    const [enemyBoard, setEnemyBoard] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));
    const { user } = useContext(UserContext);
    const enemyNickname = nicknames.find((nickname) => nickname !== user.nickname) || 'unknown';

    useEffect(() => {
        socket.on('updateGameState', ((gameplayState: gameplayState) => {
            if (gameplayState.player1 === user.sessionId) {

                const newEnemyBoard = [...gameplayState.player1Board.map(row => [...row])];
                setEnemyBoard(newEnemyBoard);

                const newEnemyViewMyBoard = [...gameplayState.player2Board.map(row => [...row])];

                const updatedMyBoard = myBoard.map((row, rowIndex) =>
                    row.map((cell, colIndex) =>
                        (newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DAMAGED || newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DEAD)
                            ? 6
                            : cell
                    )
                );

                setMyBoard(updatedMyBoard);

            } else {
                const newEnemyBoard = [...gameplayState.player2Board.map(row => [...row])];
                setEnemyBoard(newEnemyBoard);

                const newEnemyViewMyBoard = [...gameplayState.player1Board.map(row => [...row])];

                const updatedMyBoard = myBoard.map((row, rowIndex) =>
                    row.map((cell, colIndex) =>
                        newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DAMAGED
                            ? 6
                            : cell
                    )
                );

                setMyBoard(updatedMyBoard);
            }
            setGameplayStageRoom({...gameplayState})
        }));

        socket.on('victory', ((victoryMessage: string) => {
            alert(victoryMessage);
        }))

        return () => {
            socket.off('updateGameState');
            socket.off('victory');
        }
    }, [])

    return (
        <div className="gameplay">
            <span>{gameplayStageRoom.turn} turn</span>
            <div className="gameplay__player">
                <div className="gameplay__player--title">
                    You
                </div>
                <MyBoard myBoard={myBoard} />
            </div>
            <div className="gameplay__player">
                <div className="gameplay__player--title">
                    {enemyNickname}
                </div>
                <EnemyBoard enemyBoard={enemyBoard} gameplayStageRoom={gameplayStageRoom} />
            </div>
        </div>
    )
}

export default GamePlay