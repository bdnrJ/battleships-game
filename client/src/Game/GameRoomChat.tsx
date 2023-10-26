import { useState, useContext, useRef, useEffect, SetStateAction } from "react";
import { UserContext } from "../context/UserContext";
import { RoomContext } from "../context/RoomContext";
import socket from "../utils/socket";
import { AiOutlineSend, AiOutlineArrowDown } from "react-icons/ai";
import ChatMessage, { ChatMessageType } from "./ChatMessage";

type Props = {
	closeChat: () => void;
	messages: ChatMessageType[];
	setMessages: React.Dispatch<SetStateAction<ChatMessageType[]>>;
	arePlaying: boolean;
	chatScrollDownLock: boolean;
	setChatScrollDownLock: React.Dispatch<SetStateAction<boolean>>;
};

const GameRoomChat = ({ closeChat, messages, arePlaying, chatScrollDownLock, setChatScrollDownLock }: Props) => {
	const [userMessage, setUserMessage] = useState<string>("");

	const { user } = useContext(UserContext);
	const { room } = useContext(RoomContext);
	const chatDivRef = useRef<HTMLDivElement>(null); // Ref for the chat div
	const gameChatRef = useRef<HTMLDivElement>(null);

	const handleSendMessage = (message: string, roomId: string, nickname: string) => {
		if (userMessage.trim() === "") return;
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

	const handleScroll = () => {
		if (chatDivRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = chatDivRef.current;

			const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

			if(distanceFromBottom >= 300){
				console.log("when this is");
				
				setChatScrollDownLock(false);
			}

			if(distanceFromBottom === 0){
				setChatScrollDownLock(true);
			}
		}
	};

	const handleOnScrollDown = () => {
		chatDivRef.current?.removeEventListener("scroll", handleScroll);
		scrollToBottom();
		setChatScrollDownLock(true);
		chatDivRef.current?.addEventListener("scroll", handleScroll);
	};

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

	useEffect(() => {
		//if chat is in 'scroll down on new message mode' then scroll to bottom on each new message (duh)
		if (chatScrollDownLock) {
			scrollToBottom();
		}
	}, [messages]);

	useEffect(() => {
		chatDivRef.current?.addEventListener("scroll", handleScroll);

		return () => {
			chatDivRef.current?.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<div className={`gamechat ${arePlaying ? "--playing" : ""}`} ref={gameChatRef}>
			<button className='g__button --200w' onClick={closeChat} aria-label='close chat button'>
				Close chat
			</button>

			<button
				className={`gamechat--scrollbtn ${
					chatDivRef.current &&
					chatDivRef.current.scrollHeight > chatDivRef.current.clientHeight &&
					!chatScrollDownLock &&
					"--visible"
				}`}
				onClick={handleOnScrollDown}
				aria-label='scroll down button'
			>
				<AiOutlineArrowDown />
			</button>

			<div className='gamechat--chat' ref={chatDivRef}>
				{messages.map((message, idx) => (
					<ChatMessage key={idx + message.type + message.message} msg={message} />
				))}
			</div>
			<div className='gamechat--input'>
				<label htmlFor='chat_input'>
					<input
						name='chat_input'
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
