import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react"
import { UserContext } from "../../context/UserContext"
import { GameRoomType } from "../../context/RoomContext"
import EnemyBoard from "./EnemyBoard"
import MyBoard from "./MyBoard"
import { gameplayState } from "../../views/GameRoom"
import socket from "../../utils/socket"

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

const GamePlay = ({ myBoard, setMyBoard, nicknames, gameplayStageRoom }: Props) => {
    const [enemyBoard, setEnemyBoard] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));
    const [enemyViewMyBoard, setEnemyViewMyBoard] = useState<number[][]>();
    const { user } = useContext(UserContext);
    const [enemyNickname, setEnemyNickame] = useState<string>(nicknames.find((nickname) => nickname !== user.nickname) || 'unknown');

    useEffect(() => {
        socket.on('updateGameState', ((gameplayState: gameplayState) => {

            if (gameplayState.player1 === user.nickname) {

                const newEnemyBoard = [...gameplayState.player1Board.map(row => [...row])];
                setEnemyBoard(newEnemyBoard);

                console.log("1");
                console.log(gameplayState.player1Board)

                const newEnemyViewMyBoard = [...gameplayState.player2Board.map(row => [...row])];
                setEnemyViewMyBoard(newEnemyViewMyBoard);

                console.log(gameplayState.player2Board)
                

                const updatedMyBoard = myBoard.map((row, rowIndex) =>
                    row.map((cell, colIndex) =>
                        newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DAMAGED
                            ? 6 // Keep damaged cells unchanged
                            : cell
                    )
                );

                setMyBoard(updatedMyBoard);

            } else {
                console.log("2");
                const newEnemyBoard = [...gameplayState.player2Board.map(row => [...row])];
                setEnemyBoard(newEnemyBoard);

                console.log(gameplayState.player2Board)


                const newEnemyViewMyBoard = [...gameplayState.player1Board.map(row => [...row])];
                setEnemyViewMyBoard(newEnemyViewMyBoard);

                console.log(gameplayState.player1Board)

                const updatedMyBoard = myBoard.map((row, rowIndex) =>
                    row.map((cell, colIndex) =>
                        newEnemyViewMyBoard[rowIndex][colIndex] === CellType.DAMAGED
                            ? 6 // Keep damaged cells unchanged
                            : cell
                    )
                );

                setMyBoard(updatedMyBoard);
            }

        }));

        return () => {

            socket.off('updateGameState');

        }
    }, [])

    return (
        <div className="gameplay">
            <button onClick={() => console.log(enemyBoard)} >enemy board</button>
            <button onClick={() => console.log(enemyViewMyBoard)} >enemy's view on my board</button>
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
                <EnemyBoard enemyBoard={enemyBoard} />
            </div>
        </div>
    )
}

export default GamePlay