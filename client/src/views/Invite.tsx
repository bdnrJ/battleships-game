import { useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../utils/socket";
import { UserContext, handleUserWithNoNickanme, handleUserWithNoNickanmeBeforeJoin } from "../context/UserContext";
import { GameRoomType, RoomContext } from "../context/RoomContext";
import { useCenterModal } from "../hooks/useCenterModal";
import JoinRoomWithPassword from "../components/modals/JoinRoomWithPassword";
import RoomError from "../components/modals/RoomError";

const Invite = () => {
	const { user, setUser } = useContext(UserContext);
	const { setRoom } = useContext(RoomContext);
	const navigate = useNavigate();
	const { id } = useParams();
	const { showCenterModal, closePopup } = useCenterModal();

	if (!id || id.trim() === "") {
		navigate("/rooms");
	}

	useEffect(() => {
		socket.emit("findRoom", id);

		socket.on("roomFound", (room: GameRoomType) => {
			if (!room.hasPassword) {
				if (user.nickname === "") {
					const nickname = handleUserWithNoNickanmeBeforeJoin(setUser);
					socket.emit("joinRoom", id, nickname);
				} else {
					socket.emit("joinRoom", id, user.nickname);
				}
			} else {
				showCenterModal(<JoinRoomWithPassword gameRoom={room} closePopup={closePopup} />);
			}
		});

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

		socket.on("roomError", (message: string) => {
			showCenterModal(<RoomError handleClose={closePopup} errMessage={message} />, () => navigate("/rooms"));
		});

		return () => {
			socket.off("roomFound");
			socket.off("roomJoined");
			socket.off("roomError");
		};
	}, []);

	return (
		<div className='invite--wrapper'>
			<div className='invite'>
				<h1>Connecting to the server...</h1>
			</div>
		</div>
	);
};

export default Invite;
