import { useContext, useEffect, useRef, useState } from "react";
import { GameRoomType, GameStage, RoomContext } from "../context/RoomContext";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import { UserContext } from "../context/UserContext";
import Waiting from "../Game/Waiting";
import GamePlay from "../Game/GamePlay/GamePlay";
import ShipPlacement from "../Game/ShipPlacement";
import GameRoomChat from "../Game/GameRoomChat";

export type someoneLeftObject = {
	updatedRoom: GameRoomType;
	idOfUserThatLeft: string;
};

export type gameplayState = {
	roomId: string;
	player1: string;
	player1Board: number[][];
	player2: string;
	player2Board: number[][];
	turn: string;
};

const emptyMatrix = [[], []];

const emptyGameplayState: gameplayState = {
	roomId: "",
	player1: "",
	player1Board: emptyMatrix,
	player2: "",
	player2Board: emptyMatrix,
	turn: "",
};

const GameRoom = () => {
	const [boardState, setBoardState] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));
	const [gameplayStageRoom, setGameplayStageRoom] = useState<gameplayState>(emptyGameplayState);

	const { user } = useContext(UserContext);
	const { room, setRoom } = useContext(RoomContext);

	const useEffectRef = useRef<boolean>(false);

	const navigate = useNavigate();

	// if (room.id === "") navigate("/");

	const leaveRoom = () => {
		// if (room.id === "") window.location.reload();

		socket.emit("leaveRoom", room.id, user.nickname);

		setRoom({
			id: "",
			roomName: "",
			hostName: "",
			clients: [],
			gameState: GameStage.WAITING,

			hasPassword: false,
			password: "",
		});

		// navigate("/");
	};

	useEffect(() => {
		socket.on("someoneJoined", (updatedRoom: GameRoomType) => {
			setRoom(updatedRoom);
		});

		socket.on("someoneLeft", (someoneLeft: someoneLeftObject) => {
			setRoom(someoneLeft.updatedRoom);
		});

		socket.on("readinessChange", (room: GameRoomType) => {
			setRoom(room);
		});

		socket.on("startPlayingStage", (room: GameRoomType) => {
			setRoom(room);
		});

		socket.on("playingStageBoards", (newRoom: gameplayState) => {
			setGameplayStageRoom(newRoom);
		});

		return () => {
			// this makes sure that unmounting component (leaving game room) notices server about it
			if (useEffectRef.current) leaveRoom();

			useEffectRef.current = true;
			// this makes sure that unmounting component (leaving game room) notices server about it

			socket.off("someoneJoined");
			socket.off("someoneLeft");
			socket.off("recieveMessage");
			socket.off("readinessChange");
			socket.off("startPlayingStage");
			socket.off("playingStageBoards");
		};
	}, []);

	return (
		<div className='gameroom-wrapper'>
			<div className='gameroom'>
				<div className='gameroom__left'>
					<div className='gameroom__left--top'>
						<div className='gameroom__left--top--leave'>
							<button className='gameroom__leave-button' aria-label='leave button'>
								{"<- Leave"}
							</button>
						</div>
						<div className='gameroom__left--top--title'>{room.roomName}</div>
					</div>
					<div className='gameroom__left--game'>
						{room.gameState === GameStage.WAITING && <Waiting />}
						{room.gameState === GameStage.PLACEMENT && <ShipPlacement board={boardState} setBoard={setBoardState} />}
						{room.gameState === GameStage.PLAYING && (
							<GamePlay
								myBoard={boardState}
								setMyBoard={setBoardState}
								nicknames={[room.clients[0].nickname, room.clients[1].nickname]}
								gameplayStageRoom={gameplayStageRoom}
								setGameplayStageRoom={setGameplayStageRoom}
							/>
						)}
					</div>
				</div>
				<GameRoomChat />
			</div>
		</div>
	);
};

export default GameRoom;
