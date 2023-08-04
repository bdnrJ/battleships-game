import { useContext, useEffect, useRef, useState } from 'react'
import { GameRoomType, GameStage, RoomContext } from '../context/RoomContext'
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';
import { v4 } from 'uuid';
import { UserContext } from '../context/UserContext';
import { AiOutlineSend } from 'react-icons/ai';
import Game from '../Game/ShipPlacement';
import Waiting from '../Game/Waiting';
import GamePlay from '../Game/GamePlay/GamePlay';
import ShipPlacement from '../Game/ShipPlacement';

type someoneLeftObject = {
    updatedRoom: GameRoomType,
    idOfUserThatLeft: string,
}

const GameRoom = () => {
    const [userMessage, setUserMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [boardState, setBoardState] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));


    const { user } = useContext(UserContext);
    const { room, setRoom } = useContext(RoomContext);

    const useEffectRef = useRef<boolean>(false);
    const chatDivRef = useRef<HTMLDivElement>(null); // Ref for the chat div

    const navigate = useNavigate();

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

    const scrollToBottom = () => {
        if (chatDivRef.current) {
            chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
        }
    };

    const leaveRoom = () => {
        if (room.id === '') window.location.reload();

        socket.emit('leaveRoom', room.id, user.nickname);

        setRoom({
            id: '',
            roomName: '',
            hostName: '',
            clients: [],
            clientNicknames: [],
            clientBoards: [],
            gameState: GameStage.WAITING,
            clientReady: [],

            hasPassword: false,
            password: '',
        });

        navigate('/');
    };

    useEffect(() => {
        socket.on('someoneJoined', ((updatedRoom: GameRoomType, nickname: string) => {
            const nMessages = messages;
            nMessages.push(`${nickname} has joined the room`);
            setMessages(nMessages);
            setRoom(updatedRoom);
            scrollToBottom()
        }))

        socket.on('someoneLeft', ((someoneLeft: someoneLeftObject, nickname: string) => {
            const nMessages = messages;
            nMessages.push(`${nickname} has left the room`);
            setMessages(nMessages);
            setRoom(someoneLeft.updatedRoom);
            scrollToBottom()
        }))

        socket.on('recieveMessage', ((message: string, nickname: string,) => {
            const nMessages = messages;
            nMessages.push(`${nickname}: ${message}`);
            setMessages([...nMessages])
            scrollToBottom()
        }))

        socket.on('readinessChange', ((room: GameRoomType) => {
            setRoom(room);
        }))

        socket.on('startPlayingStage', ((room: GameRoomType) => {
            setRoom(room);
        }))

        return () => {
            // this makes sure that unmounting component (leaving game room) notices server about it
            if (useEffectRef.current)
                leaveRoom();

            useEffectRef.current = true;
            // this makes sure that unmounting component (leaving game room) notices server about it

            socket.off('someoneJoined');
            socket.off('someoneLeft');
            socket.off('recieveMessage');
            socket.off('readinessChange');
            socket.off('startPlayingStage');
        };
    }, []);

    return (
        <div className="gameroom-wrapper">
            <div className="gameroom">
                <div className="gameroom__left">
                    <div className="gameroom__left--top">
                        <div className="gameroom__left--top--leave">
                            <button>{'<- Leave'}</button>
                        </div>
                        <div className="gameroom__left--top--title">
                            {room.roomName}
                        </div>
                    </div>
                    <div className="gameroom__left--game">
                        {room.gameState === GameStage.WAITING &&
                            <Waiting />
                        }
                        {room.gameState === GameStage.PLACEMENT &&
                            <ShipPlacement board={boardState} setBoard={setBoardState} />
                        }
                        {room.gameState === GameStage.PLAYING &&
                            <GamePlay myBoard={boardState} setMyBoard={setBoardState} nicknames={room.clientNicknames}/>
                        }
                    </div>
                </div>
                <div className="gameroom__right">
                    <div className="gameroom__right--users">
                        <div className="gameroom__right--users--title">
                            Players:
                        </div>
                        <div className="gameroom__right--users--list">
                            {room.clientNicknames.map((client) => (
                                <span key={client}>
                                    {client}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="gameroom__right--chat" ref={chatDivRef}>
                        {messages.map((message) => (
                            <span key={v4()}>
                                {message}
                            </span>
                        ))}
                    </div>
                    <div className="gameroom__right--input">
                        <input type="text" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} onKeyDown={onEnterSendMessage} />
                        <button onClick={() => handleSendMessage(userMessage, room.id, user.nickname)} ><AiOutlineSend /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GameRoom