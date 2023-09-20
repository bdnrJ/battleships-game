import { useContext } from "react";
import { RoomContext } from "../context/RoomContext";
import socket from "../utils/socket";
import { UserContext } from "../context/UserContext";

const Waiting = () => {
	const { room } = useContext(RoomContext);
	const { user } = useContext(UserContext);

	const handleCheckReady = () => {
		if (!room.clients.find((clinet) => clinet.id === user.sessionId)?.readiness)
			socket.emit("declareReady", room.id, user.nickname);
	};

	return (
		<div className='waiting'>
			<h1 className='waiting__title'>Waiting for both players to be ready...</h1>
			<div className='waiting__players'>
				{room.clients.map((client, idx) => (
					<span key={client.id + client.nickname}>
						{`${client.id === user.sessionId ? "You" : client.nickname}: `}
						<p className={`${room.clients[idx].readiness ? "--ready" : "--notready"}`} >{`${room.clients[idx].readiness ? "Ready" : "Not ready"}`}</p>
					</span>
				))}
			</div>
			<div className='waiting__declare'>
				<button onClick={handleCheckReady}>Check Ready</button>
			</div>
		</div>
	);
};

export default Waiting;
