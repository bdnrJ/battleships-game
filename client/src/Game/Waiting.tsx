import { useContext, useRef } from "react";
import { RoomContext } from "../context/RoomContext";
import socket from "../utils/socket";
import { UserContext } from "../context/UserContext";
import {FaRegCopy} from 'react-icons/fa';

const Waiting = () => {
	const { room } = useContext(RoomContext);
	const { user } = useContext(UserContext);

	const inviteLink = `http://localhost:5173/invite/${room.id}`;

	const inviteLinkRef = useRef<HTMLInputElement | null>(null);

    const handleCopyLink = () => {
        // Select the text inside the input element
				if(inviteLinkRef.current === null) return;
        inviteLinkRef.current.select();
        // Copy the selected text to the clipboard
        document.execCommand('copy');
    };

	const handleCheckReady = () => {
		if (!room.clients.find((clinet) => clinet.id === user.sessionId)?.readiness)
			socket.emit("declareReady", room.id, user.nickname);
	};

	return (
		<div className='waiting'>
			<h1 className='waiting__title'>
				{room.clients.length === 1 ? "Waiting for another player..." : "Waiting for both players to be ready..."}
			</h1>
			<div className='waiting__players'>
				{room.clients.map((client, idx) => (
					<span key={client.id + client.nickname}>
						{`${client.id === user.sessionId ? "You" : client.nickname}: `}
						<p className={`${room.clients[idx].readiness ? "--ready" : "--notready"}`}>{`${
							room.clients[idx].readiness ? "Ready" : "Not ready"
						}`}</p>
					</span>
				))}
			</div>
			<div className='waiting__declare'>
				<button onClick={handleCheckReady}>Check Ready</button>
			</div>
			{room.clients.length !== 2 && <div className='waiting__invite'>
				<span className='waiting__text'>To invite a friend send him this URL</span>
				<input className='waiting__invite--url' ref={inviteLinkRef} readOnly value={inviteLink} />
				<button className='waiting__invite--copy' onClick={handleCopyLink}>
						<span>Copy</span>
					<FaRegCopy />
				</button>
			</div>}
		</div>
	);
};

export default Waiting;
