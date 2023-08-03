import React, { useContext } from 'react'
import { RoomContext } from '../context/RoomContext'
import socket from '../utils/socket';
import { UserContext } from '../context/UserContext';
import { v4 } from 'uuid';

const Waiting = () => {

    const { room } = useContext(RoomContext);
    const { user } = useContext(UserContext);

    const handleCheckReady = () => {
        socket.emit('declareReady', room.id, user.nickname);
    }

    return (
        <div className="waiting">
            <div className="waiting__title">
                Waiting for both players to be ready...
            </div>
            <div className="waiting__players">
                <div className="waiting__players--player">
                    {room.clientNicknames.map((client, idx) => (
                        <span key={v4()} >
                            {`${client}: ${room.clientReady[idx] ? 'ready' : 'notready'}`}
                        </span>
                    ))}

                </div>
            </div>
            <div className="waiting__declare">
                <button onClick={handleCheckReady} >Check Ready</button>
            </div>
        </div>
    )
}

export default Waiting