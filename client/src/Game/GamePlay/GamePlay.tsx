import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { UserContext } from "../../context/UserContext"
import { GameRoomType } from "../../context/RoomContext"
import EnemyBoard from "./EnemyBoard"
import MyBoard from "./MyBoard"
import { gameplayState } from "../../views/GameRoom"

type Props = {
    myBoard: number[][],
    setMyBoard: Dispatch<SetStateAction<number[][]>>
    nicknames: string[]  
    gameplayStageRoom: gameplayState,
    setGameplayStageRoom: Dispatch<SetStateAction<gameplayState>> 
}

export enum CellType{
    NORMAL = 0,
    HIT = 1,
    DAMAGED = 2,
    DEAD = 3,
    AROUNDDEAD = 4,
}

const GamePlay = ({myBoard, setMyBoard, nicknames, gameplayStageRoom}: Props) => {
    const enemyInit = [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 4, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
                        // const [enemyBoard, setEnemyBoard] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));
    const [enemyBoard, setEnemyBoard] = useState<number[][]>(enemyInit);
    const [enemyViewMyBoard, setEnemyViewMyBoard] = useState<number[][]>();
    const {user} = useContext(UserContext);
    const [enemyNickname, setEnemyNickame] = useState<string>(nicknames.find((nickname) => nickname !== user.nickname) || 'unknown');

    useEffect(() =>{
        if(gameplayStageRoom.player1 === user.nickname){
            setEnemyBoard(gameplayStageRoom.player1Board);
            setEnemyViewMyBoard(gameplayStageRoom.player2Board);
        }else{
            setEnemyBoard(gameplayStageRoom.player2Board);
            setEnemyViewMyBoard(gameplayStageRoom.player1Board);
        }
    }, [gameplayStageRoom])

    return (
        <div className="gameplay">
            <button onClick={() => console.log(enemyBoard)} >enemy board</button>
            <button onClick={() => console.log(enemyViewMyBoard)} >enemy's view on my board</button>
            <div className="gameplay__player">
                <div className="gameplay__player--title">
                    You
                </div>
                <MyBoard myBoard={myBoard}/>
            </div>
            <div className="gameplay__player">
                <div className="gameplay__player--title">
                    {enemyNickname}
                </div>
                <EnemyBoard  enemyBoard={enemyBoard}/>
            </div>
        </div>
    )
}

export default GamePlay