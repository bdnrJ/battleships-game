import React from "react";

export type ChatMessage = {
	nickname?: string;
	type: "me" | "anon" | "info";
	message: string;
};

type Props = {
	msg: ChatMessage;
};

const ChatMessage = ({ msg }: Props) => {
	if (msg.type === "info") return <div className='chat-message --info'>{msg.message}</div>;

	if (msg.type === "me")
		return (
			<div className='chat-message --me'>
				<div className='chat-message__message'>{msg.message}</div>
			</div>
		);

	if (msg.type === "anon")
		return (
			<div className='chat-message --anon'>
        <div className="chat-message__nick">{msg.nickname}</div>
				<div className='chat-message__message'>{msg.message}</div>
			</div>
		);
};

export default ChatMessage;
