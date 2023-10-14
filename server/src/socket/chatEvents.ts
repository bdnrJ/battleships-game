import { Server } from "socket.io";

export function setupChatEvents(io: Server) {
	io.on("connection", (socket) => {
    
		socket.on("sendMessage", (message: string, roomId: string, nickname: string) => {
			console.log("send message by " + nickname);
			io.to(roomId).emit("recieveMessage", message, nickname);
		});
	});
}
