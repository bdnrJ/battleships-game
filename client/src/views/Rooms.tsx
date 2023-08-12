import { useContext, useEffect, useState, useRef } from "react";
import socket from "../utils/socket";
import Modal from "../components/modals/Modal";
import CreateRoom from "../components/modals/CreateRoom";
import Room from "../components/Room";
import { useNavigate } from "react-router-dom";
import { GameRoomType, RoomContext } from "../context/RoomContext";
import { UserContext } from "../context/UserContext";
import { AiOutlinePlus } from "react-icons/ai";

const Rooms = () => {
	const [isCreateRoomVisible, setIsCreateRoomVisible] = useState<boolean>(false);
	const [rooms, setRooms] = useState<GameRoomType[]>([]);
	const { setRoom } = useContext(RoomContext);
	const { user } = useContext(UserContext);
	const navigate = useNavigate();

	//to make useeffect work once for tests :)
	const effectCalled = useRef<boolean>(false);

	useEffect(() => {
		// if (effectCalled.current) return;
		// Emit the event to request the list of available rooms
		socket.emit("getRooms");

		// Listen for the event that sends the list of available rooms
		socket.on("roomsList", (availableRooms) => {
			setRooms([...availableRooms]);
		});

		socket.on("roomJoined", (room) => {
			setRoom(room);
			navigate(`/room/${room.id}`);
		});

		socket.on("roomError", (error) => console.log(error));

		// Clean up the event listener when the component unmounts
		effectCalled.current = true;
		return () => {
			socket.off("roomsList"); // Remove the 'roomsList' event listener
			socket.off("roomJoined"); // Remove the 'roomJoined' event listener
			socket.off("roomError"); // Remove the 'roomError' event listener
		};
	}, []); // Empty dependency array to run the effect only once when the component mounts

	// Function to create a new room
	const createRoom = (gameRoom: GameRoomType) => {
		socket.emit("createRoom", gameRoom, user.nickname); // You can change the room name as needed
	};

	return (
		<div className='rooms'>
			<div className='rooms__controlls'>
				<button onClick={() => setIsCreateRoomVisible(true)}>
					<span>Create Room</span>
					<AiOutlinePlus />
				</button>
			</div>
			<div className='rooms__game-rooms'>
				{rooms.map((room) => (
					<Room key={room.id} gameRoom={room} />
				))}
			</div>
			{isCreateRoomVisible && (
				<Modal onClose={() => setIsCreateRoomVisible(false)}>
					<CreateRoom closePopup={() => setIsCreateRoomVisible(false)} createRoom={createRoom} />
				</Modal>
			)}
		</div>
	);
};

export default Rooms;
