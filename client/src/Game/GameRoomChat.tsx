import { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { GameRoomType, RoomContext } from "../context/RoomContext";
import socket from "../utils/socket";
import { v4 } from "uuid";
import { AiOutlineSend } from "react-icons/ai";
import { someoneLeftObject } from "../views/GameRoom";

const GameRoomChat = () => {
	const [userMessage, setUserMessage] = useState<string>("");
	const [messages, setMessages] = useState<string[]>([]);

	const { user } = useContext(UserContext);
	const { room } = useContext(RoomContext);
	const chatDivRef = useRef<HTMLDivElement>(null); // Ref for the chat div

	const handleSendMessage = (message: string, roomId: string, nickname: string) => {
		if (userMessage.trim() === "") return;
    console.log(user);
		socket.emit("sendMessage", message, roomId, nickname);
		setUserMessage("");
	};

	const onEnterSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSendMessage(userMessage, room.id, user.nickname);
		}
	};

	const scrollToBottom = () => {
		if (chatDivRef.current) {
			chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
		}
	};

	useEffect(() => {
		socket.on("someoneJoined", (updatedRoom: GameRoomType, nickname: string) => {
			const nMessages = messages;
			nMessages.push(`${nickname} has joined the room`);
			setMessages(nMessages);
			scrollToBottom();
		});

		socket.on("someoneLeft", (someoneLeft: someoneLeftObject, nickname: string) => {
			const nMessages = messages;
			nMessages.push(`${nickname} has left the room`);
			setMessages(nMessages);
			scrollToBottom();
		});

		socket.on("recieveMessage", (message: string, nickname: string) => {
			const nMessages = messages;
			nMessages.push(`${nickname}: ${message}`);
			setMessages([...nMessages]);
			scrollToBottom();
		});

		return () => {
			socket.off("someoneJoined");
			socket.off("someoneLeft");
			socket.off("recieveMessage");
		};
	}, []);

	return (
		<div className='gameroom__right'>
			<div className='gameroom__right--users'>
				<div className='gameroom__right--users--title'>Players:</div>
				<div className='gameroom__right--users--list'>
					{room.clients.map((client) => (
						<span key={client.id + client.nickname}>{client.nickname}</span>
					))}
				</div>
			</div>
			<div className='gameroom__right--chat' ref={chatDivRef}>
				{messages.map((message) => (
					<span key={v4()}>{message}</span>
				))}
			</div>
			<div className='gameroom__right--input'>
				<input
					type='text'
					value={userMessage}
					onChange={(e) => setUserMessage(e.target.value)}
					onKeyDown={onEnterSendMessage}
				/>
				<button onClick={() => handleSendMessage(userMessage, room.id, user.nickname)}>
					<AiOutlineSend />
				</button>
			</div>
		</div>
	);
};

export default GameRoomChat;
