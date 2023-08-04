import { Dispatch, SetStateAction, useContext, useState } from "react"
import { UserContext } from "../../context/UserContext"
import { GameRoomType } from "../../context/RoomContext"
import EnemyBoard from "./EnemyBoard"
import MyBoard from "./MyBoard"

type Props = {
    myBoard: number[][],
    setMyBoard: Dispatch<SetStateAction<number[][]>>
    nicknames: string[]   
}

export enum CellType{
    NORMAL = 0,
    HIT = 1,
    DAMAGED = 2,
    DEAD = 3,
    AROUNDDEAD = 4,
}

const GamePlay = ({myBoard, setMyBoard, nicknames}: Props) => {
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
    const {user} = useContext(UserContext);
    const [enemyNickname, setEnemyNickame] = useState<string>(nicknames.find((nickname) => nickname !== user.nickname) || 'unknown');

    return (
        <div className="gameplay">
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