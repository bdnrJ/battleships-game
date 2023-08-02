import { useContext, useEffect, useRef, useState } from 'react'
import { GameRoomType, RoomContext } from '../context/RoomContext'
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';
import { v4 } from 'uuid';
import { UserContext } from '../context/UserContext';

type someoneLeftObject = {
    updatedRoom: GameRoomType,
    idOfUserThatLeft: string,
}

const GameRoom = () => {
    const [userMessage, setUserMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
    const { room, setRoom } = useContext(RoomContext);
    const reff = useRef<boolean>(false);
    if (room.id === "") navigate('/');

    const handleSendMessage = (message: string, roomId: string, nickname: string) => {
        if (userMessage.trim() === "") return;
        socket.emit('sendMessage', message, roomId, nickname);
        setUserMessage('');
    }

    const onEnterSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage(userMessage, room.id, user.nickname);
        }
    };

    const leaveRoom = () => {
        if (room.id === '') window.location.reload();

        socket.emit('leaveRoom', room.id, user.nickname);

        setRoom({
            id: '',
            roomName: '',
            hostName: '',
            hasPassword: false,
            password: '',
            clients: [],
            clientNicknames: [],
        });

        navigate('/');
    };

    useEffect(() => {
        socket.on('someoneJoined', ((updatedRoom: GameRoomType, nickname: string) => {
            const nMessages = messages;
            nMessages.push(`${nickname} has joined the room`);
            setMessages(nMessages);
            setRoom(updatedRoom);
            console.log(nMessages);
        }))

        socket.on('someoneLeft', ((someoneLeft: someoneLeftObject, nickname: string) => {
            const nMessages = messages;
            nMessages.push(`${nickname} has left the room`);
            setMessages(nMessages);
            setRoom(someoneLeft.updatedRoom);
            console.log(nMessages);
        }))

        socket.on('recieveMessage', ((message: string, nickname: string,) => {
            const nMessages = messages;
            nMessages.push(`${nickname}: ${message}`);
            setMessages([...nMessages])
        }))


        return () => {
            // this makes sure that unmounting component (leaving game room) notices server about it
            if (reff.current)
                leaveRoom();

            reff.current = true;
            // this makes sure that unmounting component (leaving game room) notices server about it

            socket.off('someoneJoined');
            socket.off('someoneLeft');
            socket.off('recieveMessage');
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
                {room.clientNicknames?.map((client) => (
                    <div key={client} >
                        {client}
                    </div>
                ))}
            </div>

            <div className="gameroom__chatbox">
                <div className="gameroom__chatbox--messages">
                    {messages.map((message) => (
                        <div key={v4()} >
                            {message}
                        </div>
                    ))}
                </div>
                <div className="gameroom__chatbox--input">
                    <input type="text" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} onKeyDown={onEnterSendMessage} />
                    <button onClick={() => handleSendMessage(userMessage, room.id, user.nickname)} >Send</button>
                </div>
            </div>
        </div>
    )
}

export default GameRoom