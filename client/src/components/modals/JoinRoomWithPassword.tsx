import  { useContext, useState } from "react";
import { GameRoomType } from "../../context/RoomContext";
import socket from "../../utils/socket";
import { useAlert } from "../../hooks/useAlert";
import { UserContext } from "../../context/UserContext";

type Props = {
	gameRoom: GameRoomType;
  closePopup: () => void;
};

const JoinRoomWithPassword = ({ gameRoom, closePopup }: Props) => {
	const [password, setPassword] = useState<string>("");
	const { showAlert } = useAlert();
  const {user} = useContext(UserContext);

	const handleRoomJoin = () => {
    console.log(password);
    console.log(gameRoom.password);
    
		if (password === gameRoom.password) {
			socket.emit("joinRoom", gameRoom.id, user.nickname, password);
      closePopup();
		} else {
			showAlert("Wrong password", "failure");
		}
	};

	return (
		<div className='joinroom'>
			<h1 className='joinroom__title'>Join Room</h1>
			<div className='joinroom__input'>
				<label htmlFor='password'>
					<span>Password</span>
					<input type='text' name='password' onChange={(e) => setPassword(e.target.value)} />
				</label>
			</div>
			<div className='joinroom__button'>
				<button onClick={handleRoomJoin}>Join</button>
			</div>
		</div>
	);
};

export default JoinRoomWithPassword;
