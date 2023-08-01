import { useContext, useEffect, useRef } from 'react'
import { RoomContext } from '../context/RoomContext'
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';

const GameRoom = () => {
    const navigate = useNavigate();
    const { room, setRoom } = useContext(RoomContext);
    const reff = useRef<boolean>(false);
    if (room.id === "") navigate('/');

    const leaveRoom = () => {
        if(room.id === '') window.location.reload();

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


        return () => {
            if(reff.current)
                leaveRoom();

            reff.current = true;
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
        </div>
    )
}

export default GameRoom