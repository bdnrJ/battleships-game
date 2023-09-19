import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

type Props = {
    children: ReactNode,
}

export enum GameStage {
    WAITING = 0,
    PLACEMENT = 1,
    PLAYING = 2,
}

interface Client {
	id: string;
	nickname: string;
	board: number[][][]
	readiness: boolean;
}

export interface GameRoomType {
	id: string;
	roomName: string;
	hostName: string;

	clients: Client[];

	gameState: number;

	hasPassword: boolean;
	password: string;
}


interface RoomContextProps {
    room: GameRoomType,
    setRoom: Dispatch<SetStateAction<GameRoomType>>
}

const defaultRoom: GameRoomType = {
    id: '',
    roomName: '',
    hostName: '',
    clients: [],
    gameState: GameStage.WAITING,

    hasPassword: false,
    password: '',
}

export const RoomContext = createContext<RoomContextProps>({
    room: {
        id: '',
        roomName: '',
        hostName: '',
        clients: [],
        gameState: GameStage.WAITING,
    
        hasPassword: false,
        password: '',
    },
    setRoom: () => { }
})

export const RoomProvider = ({ children }: Props) => {
    const [room, setRoom] = useState<GameRoomType>(defaultRoom);

    return (
        <RoomContext.Provider value={{ room, setRoom }}>
            {children}
        </RoomContext.Provider>
    )
}
