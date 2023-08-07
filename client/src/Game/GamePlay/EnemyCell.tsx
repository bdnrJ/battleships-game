import React, { useContext } from 'react'
import { CellType } from './GamePlay'
import socket from '../../utils/socket'
import { UserContext } from '../../context/UserContext'
import { RoomContext } from '../../context/RoomContext'

type Props = {
    value: number,
    rowIdx: number,
    colIdx: number,
    turn: string,
}

const EnemyCell = ({ value, rowIdx, colIdx, turn }: Props) => {

    const { room } = useContext(RoomContext);
    const { user } = useContext(UserContext);

    const handleClick = () => {
        if (value === CellType.NORMAL && user.nickname === turn) {
            
            socket.emit('missleShot', rowIdx, colIdx, user.nickname, room.id);
        }

        if(user.nickname !== turn){
            console.log("it is not out time mate");
            console.log("user nick: " +user.nickname);
            console.log("turn nick: "+ turn);
            console.log(user.nickname === turn);
            console.log('--------');
            
            
        }
    }

    return (
        <div className={`enemycell 
        ${value === CellType.NORMAL && '--normal'}
        ${value === CellType.HIT && '--hit'}
        ${value === CellType.DAMAGED && '--damaged'}
        ${value === CellType.DEAD && '--dead'}
        ${value === CellType.AROUNDDEAD && '--arounddead'}
    `}
            onClick={handleClick}
        >
            {/* {value} */}
        </div>
    )
}

export default EnemyCell