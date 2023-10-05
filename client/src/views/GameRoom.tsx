import { useContext, useEffect, useRef, useState } from "react";
import { GameRoomType, GameStage, RoomContext } from "../context/RoomContext";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import { UserContext } from "../context/UserContext";
import Waiting from "../Game/Waiting";
import GamePlay from "../Game/GamePlay/GamePlay";
import ShipPlacement from "../Game/ShipPlacement";
import GameRoomChat from "../Game/GameRoomChat";
import { BsFillChatFill } from "react-icons/bs";

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
	const [boardState, setBoardState] = useState<number[][]>([
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]);
	const [gameplayStageRoom, setGameplayStageRoom] = useState<gameplayState>(emptyGameplayState);

	const { user } = useContext(UserContext);
	const { room, setRoom } = useContext(RoomContext);

	const useEffectRef = useRef<boolean>(false);

	const navigate = useNavigate();

	const leaveRoom = () => {
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

		navigate("/rooms");
	};

	//chat
	const [messages, setMessages] = useState<string[]>([]);
	const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
	const [unreadMessagesCounter, setUnreadMessagesCounter] = useState<number>(0);

	const handleOpenChat = () => {
		setUnreadMessagesCounter(0);
		setIsChatOpen(true);
	};

	const handleCloseChat = () => {
		setIsChatOpen(false);
		setUnreadMessagesCounter(0);
	};

	useEffect(() => {
		socket.on("someoneJoined", (updatedRoom: GameRoomType, nickname: string) => {
			setRoom(updatedRoom);
			const nMessages = messages;
			nMessages.push(`${nickname} has joined the room`);
			setMessages(nMessages);
			if (!isChatOpen) {
				setUnreadMessagesCounter((unreadMessagesNumber) => unreadMessagesNumber + 1);
			}
		});

		socket.on("someoneLeft", (someoneLeft: someoneLeftObject, nickname: string) => {
			setRoom(someoneLeft.updatedRoom);
			const nMessages = messages;
			nMessages.push(`${nickname} has left the room`);
			setMessages(nMessages);
			if (!isChatOpen) {
				setUnreadMessagesCounter((unreadMessagesNumber) => unreadMessagesNumber + 1);
			}
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

		socket.on("recieveMessage", (message: string, nickname: string) => {
			const nMessages = messages;
			nMessages.push(`${nickname}: ${message}`);
			setMessages([...nMessages]);
			if (!isChatOpen) {
				setUnreadMessagesCounter((unreadMessagesNumber) => unreadMessagesNumber + 1);
			}
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
			socket.off("someoneJoined");
			socket.off("someoneLeft");
			socket.off("recieveMessage");
		};
	}, []);

	return (
		<div className={`gameroom-wrapper ${room.gameState === GameStage.PLAYING ? " --playing" : ""}`}>
			<div className={`gameroom ${room.gameState === GameStage.PLAYING ? " --playing" : ""}`}>
				<div className='gameroom__left'>
					<div className='gameroom__left--top'>
						<div className='gameroom__left--top--leave'>
							<button className='gameroom__leave-button' onClick={leaveRoom} aria-label='leave button'>
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
				{!isChatOpen && (
					<div className={`open-chat ${room.gameState === GameStage.PLAYING ? "--playing" : ""}`}>
						{unreadMessagesCounter > 0 && <div className='open-chat--new-message'>{unreadMessagesCounter}</div>}
						<button className='open-chat--button' aria-label='open chat button' onClick={handleOpenChat}>
							<BsFillChatFill />
						</button>
					</div>
				)}
			</div>
			{isChatOpen && (
				<GameRoomChat
					messages={messages}
					setMessages={setMessages}
					closeChat={handleCloseChat}
					arePlaying={room.gameState === GameStage.PLAYING}
				/>
			)}
		</div>
	);
};

export default GameRoom;
