export type matrix = number[][];

export enum GameStage {
	WAITING = 0,
	PLACEMENT = 1,
	PLAYING = 2,
	ENDED = 3,
}

export enum ShipTypes {
	DESTROYER = 1,
	CRUISER = 2,
	BATTLESHIP = 3,
	CARRIER = 4,
}

export enum CellType {
	NORMAL = 0,
	HIT = 1,
	DAMAGED = 2,
	DEAD = 3,
	AROUNDDEAD = 4,
}

export type gameplayState = {
	roomId: string;
	player1: string;
	player1Board: matrix;
	player1_id: number;
	player2: string;
	player2Board: matrix;
	player2_id: number,
	turn: string;
};

export interface Client {
	id: string;
	nickname: string;
	board: matrix;
	readiness: boolean;
	user_id: number;
}

export interface WaitingRoom {
	id: string;
	waitingList: WaitingClient[];
}

export interface WaitingClient {
	nickname: string;
	id: string;
}

export interface GameRoom {
	id: string;
	roomName: string;
	hostName: string;

	clients: Client[];

	gameState: number;

	hasPassword: boolean;
	password: string;
}
