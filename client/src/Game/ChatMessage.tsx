export type ChatMessageType = {
	nickname?: string;
	type: "me" | "anon" | "info";
	message: string;
	displayNick?: boolean,
};

type Props = {
	msg: ChatMessageType;
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
        {msg.displayNick && <div className="chat-message__nick">{msg.nickname}</div>}
				<div className='chat-message__message'>{msg.message}</div>
			</div>
		);
};

export default ChatMessage;
