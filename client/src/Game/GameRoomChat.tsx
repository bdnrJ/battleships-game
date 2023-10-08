import { useState, useContext, useRef, useEffect, SetStateAction } from "react";
import { UserContext } from "../context/UserContext";
import {  RoomContext } from "../context/RoomContext";
import socket from "../utils/socket";
import { v4 } from "uuid";
import { AiOutlineSend } from "react-icons/ai";

type Props = {
	closeChat: () => void;
	messages: string[],
	setMessages: React.Dispatch<SetStateAction<string[]>>;
	arePlaying: boolean,
};

const GameRoomChat = ({ closeChat, messages, arePlaying }: Props) => {
	const [userMessage, setUserMessage] = useState<string>("");

	const { user } = useContext(UserContext);
	const { room } = useContext(RoomContext);
	const chatDivRef = useRef<HTMLDivElement>(null); // Ref for the chat div
	const gameChatRef = useRef<HTMLDivElement>(null);

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

	// const scrollToBottom = () => {
	// 	if (chatDivRef.current) {
	// 		chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
	// 	}
	// };

	useEffect(() => {
		

		const handleClickOutside = (event: MouseEvent) => {
			if (gameChatRef.current && !gameChatRef.current.contains(event.target as Node)) {
				closeChat();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {

			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className={`gamechat ${arePlaying ? "--playing" : ""}`} ref={gameChatRef}>
			<div className='gamechat--chat' ref={chatDivRef}>
				<button onClick={closeChat}>close</button>
				{messages.map((message) => (
					<span key={v4()}>{message}</span>
				))}
			</div>
			<div className='gamechat--input'>
				<label htmlFor="chat_input">
					<input
						name="chat_input"
						type='text'
						value={userMessage}
						onChange={(e) => setUserMessage(e.target.value)}
						onKeyDown={onEnterSendMessage}
						placeholder='Write something...'
					/>
					<button onClick={() => handleSendMessage(userMessage, room.id, user.nickname)}>
						<AiOutlineSend />
					</button>
				</label>
			</div>
		</div>
	);
};

export default GameRoomChat;
