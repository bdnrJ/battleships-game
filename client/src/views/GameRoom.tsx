import { useContext, useEffect, useRef, useState } from 'react'
import { GameRoomType, RoomContext } from '../context/RoomContext'
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';
import {v4} from 'uuid';

type someoneLeftObject = {
    updatedRoom: GameRoomType,
    idOfUserThatLeft: string,
}

const GameRoom = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const navigate = useNavigate();
    const { room, setRoom } = useContext(RoomContext);
    const reff = useRef<boolean>(false);
    if (room.id === "") navigate('/');

    const leaveRoom = () => {
        if (room.id === '') window.location.reload();

        socket.emit('leaveRoom', room.id);

        setRoom({
            id: '',
            roomName: '',
            hostName: '',
            hasPassword: false,
            password: '',
            clients: [],
        });

        navigate('/');
    };

    useEffect(() => {
        socket.on('someoneJoined', ((updatedRoom) => {
            const nMessages = messages;
            nMessages.push(`${updatedRoom.clients[1]} has joined the room`);
            setMessages(nMessages);
            setRoom(updatedRoom);
            console.log(nMessages);
        }))

        socket.on('someoneLeft', ((someoneLeft: someoneLeftObject) => {
            const nMessages = messages;
            nMessages.push(`${someoneLeft.idOfUserThatLeft} has left the room`);
            setMessages(nMessages);
            setRoom(someoneLeft.updatedRoom);
            console.log(nMessages);
        }))


        return () => {
            if (reff.current)
                leaveRoom();

            reff.current = true;

            socket.off('someoneJoined');
            socket.off('someoneLeft');
        };
    }, []);

    return (
        <div className="gameroom">
            <div>
                {room.id}
            </div>
            <div>
                {room.hostName}
            </div>
            <div>
                {room.roomName}
            </div>
            <div>
                {room.hasPassword}
            </div>
            <div>
                {room.password}
            </div>
            <div>
                {room.clients?.map((client) => (
                    <div key={client} >
                        {client}
                    </div>
                ))}
            </div>

            <div className="gameroom__chatbox">
                {messages.map((message) => (
                    <div key={v4()} >
                        {message}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GameRoom