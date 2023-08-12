import { useContext } from "react";
import { GameRoomType } from "../context/RoomContext";
import socket from "../utils/socket";
import { UserContext } from "../context/UserContext";
import {AiOutlineArrowRight} from 'react-icons/ai'

type Props = {
	gameRoom: GameRoomType;
};

const Room = ({ gameRoom }: Props) => {
	const { user } = useContext(UserContext);
	if (gameRoom.clients.length === 0 || gameRoom.clients.length === 2) return null;

	const onRoomJoin = () => {
		socket.emit("joinRoom", gameRoom.id, user.nickname);
	};

	return (
		<div className='room' key={gameRoom.hostName + gameRoom.roomName}>
			<div className='room__elem'>
				<span className='room__elem--title'>Host</span> <span>{gameRoom.hostName}</span>
			</div>
			<div className='room__elem'>
				<span className='room__elem--title'>Name</span> <span>{gameRoom.roomName}</span>
			</div>
			<div className='room__elem'>
				<span className='room__elem--title'>Players</span> <span>{gameRoom.clients.length}/2</span>
			</div>
			<button className='room__button' onClick={onRoomJoin}>
				<span>Join Room</span>
				<AiOutlineArrowRight />
			</button>
		</div>
	);
};

export default Room;
