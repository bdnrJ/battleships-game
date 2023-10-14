import { useState, useEffect, useContext, useRef } from "react";
import socket from "../utils/socket";
import { UserContext } from "../context/UserContext";
import { GameRoomType, RoomContext } from "../context/RoomContext";
import { useNavigate } from "react-router-dom";


const QuickGame = () => {

  const [state, setState] = useState<string>("");
  const {user, setUser} = useContext(UserContext);
  const {setRoom} = useContext(RoomContext);
  const componentRef = useRef<boolean>(false);

  const navigate = useNavigate();

  const leaveWaitingList = () => {
    socket.emit('leaveWaitingList');
  }

  const handlePlay = () => {
    setState("Connecting to the server...");

    socket.emit('joinWaitingRoom', user.nickname);
  };

  useEffect(() => {
    socket.on('inWaitingList', () => {
      setState("Waiting for oponent...");
    })

    socket.on('joinQuickGameRoom', (roomId: string) => {
      console.log("joim quick game room");
      
      //(roomId: string, nickname: string, password: string, emitRooms: boolean = true)
      socket.emit('joinRoom', roomId, user.nickname, "", false);
    })

    socket.on("roomJoined", (room: GameRoomType, sessionId: string) => {
			//set user room
			setRoom(room);
			console.log("joined qucik room called");
			console.log(user);
			console.log({ ...user, sessionId: sessionId });

			setUser({ ...user, sessionId: sessionId });
			navigate(`/room/${room.id}`);
		});

    return () => {
      if (componentRef.current) leaveWaitingList();

			componentRef.current = true;


      socket.off('inWaitingList');
      socket.off('joinQuickGameRoom');
      socket.off('roomJoined');
    }
  }, []);

	return (
		<div className='quickgame--wrapper'>
			<div className='quickgame'>
				<h1 className='quickgame--title'>
          Find oponent to play with
        </h1>
        <div className="quickgame__state">
          {state}
        </div>
        <div className="quickgame__controlls">
          <button disabled={state !== ""}  onClick={handlePlay} >Play</button>
        </div>
			</div>
		</div>
	);
};

export default QuickGame;
