import { useContext, useEffect, useState, useRef } from "react";
import socket from "../utils/socket";
import CreateRoom from "../components/modals/CreateRoom";
import Room from "../components/Room";
import { useNavigate } from "react-router-dom";
import { GameRoomType, RoomContext } from "../context/RoomContext";
import { UserContext, handleUserWithNoNickanme } from "../context/UserContext";
import { AiOutlinePlus } from "react-icons/ai";
import { useCenterModal } from "../hooks/useCenterModal";

const Rooms = () => {
	const [rooms, setRooms] = useState<GameRoomType[]>([]);
	const { setRoom } = useContext(RoomContext);
	const { user, setUser, loggedUser } = useContext(UserContext);
	const navigate = useNavigate();
	const { showCenterModal, closePopup } = useCenterModal();

	//to make useeffect work once for tests :)
	const effectCalled = useRef<boolean>(false);

	useEffect(() => {
		// if (effectCalled.current) return;
		// Emit the event to request the list of available rooms
		socket.emit("getRooms");

		// Listen for the event that sends the list of available rooms
		socket.on("roomsList", (availableRooms: GameRoomType[]) => {
			setRooms([...availableRooms]);
		});

		//when user joins room
		socket.on("roomJoined", (room: GameRoomType, sessionId: string) => {
			//set user room
			setRoom(room);
			console.log("joined room called");
			console.log(user);
			console.log({ ...user, sessionId: sessionId });

			if (user.nickname === "") handleUserWithNoNickanme(setUser, sessionId);
			else setUser({ ...user, sessionId: sessionId });

			navigate(`/room/${room.id}`);
		});

		socket.on("roomError", (error) => console.log(error));

		// Clean up the event listener when the component unmounts
		effectCalled.current = true;
		return () => {
			socket.off("roomsList");
			socket.off("roomJoined");
			socket.off("roomError");
		};
	}, []);

	// Function to create a new room
	const createRoom = (gameRoom: GameRoomType) => {
		socket.emit("createRoom", gameRoom, user.nickname, loggedUser.id);
	};

	return (
		<div className='rooms'>
			<div className='rooms__controlls'>
				<button
					className='g__button --200w'
					onClick={() => showCenterModal(<CreateRoom closePopup={closePopup} createRoom={createRoom} inModal={true} />)}
				>
					<span>Create Game Room</span>
					<AiOutlinePlus />
				</button>
			</div>
			<div className={`rooms__game-rooms ${rooms.length === 0 ? "--empty" : ""}`}>
				{rooms.length === 0 ? (
					<h2>No free rooms exist at the moment. <br /> Go and create one yourself</h2>
				) : (
					<>
						{rooms.map((room) => (
							<Room key={room.id} gameRoom={room} />
						))}
					</>
				)}
			</div>
		</div>
	);
};

export default Rooms;
