import React from 'react'
import { GameRoom } from '../views/Rooms'
import socket from '../utils/socket'

type Props = {
    gameRoom: GameRoom
}

const Room = ({gameRoom}: Props) => {

    const onRoomJoin = () => {
        socket.emit('joinRoom', gameRoom.id);
    }

    return (
        <div className="room" key={gameRoom.hostName + gameRoom.roomName}>
            <span>Host: {gameRoom.hostName}</span>
            <span>Name: {gameRoom.roomName}</span>
            <span>Password: {gameRoom.hasPassword}</span>
            <span>Password xd lmao: {gameRoom.password}</span>
            <span>id: {gameRoom.id}</span>
            <button onClick={onRoomJoin} >Join Room</button>
        </div>
    )
}

export default Room