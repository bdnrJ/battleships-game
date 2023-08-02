import { useContext } from 'react'
import { GameRoomType } from '../context/RoomContext'
import socket from '../utils/socket'
import { UserContext } from '../context/UserContext'

type Props = {
    gameRoom: GameRoomType
}

const Room = ({ gameRoom }: Props) => {

    const { user } = useContext(UserContext);
    if (gameRoom.clients.length === 0 || gameRoom.clients.length === 2) return null;

    const onRoomJoin = () => {
        socket.emit('joinRoom', gameRoom.id, user.nickname);
    }

    return (
        <div className="room" key={gameRoom.hostName + gameRoom.roomName}>
            <span>Host: {gameRoom.hostName}</span>
            <span>Name: {gameRoom.roomName}</span>
            <span>Password: {gameRoom.hasPassword}</span>
            <span>Password xd lmao: {gameRoom.password}</span>
            <span>id: {gameRoom.id}</span>
            <span>players: {gameRoom.clients.length}/2</span>
            <button onClick={onRoomJoin} >Join Room</button>
        </div>
    )
}

export default Room