import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import axiosClient from "../axios-client";

type Props = {
    children: ReactNode,
}

export enum GameStage {
    WAITING = 0,
    PLACEMENT = 1,
    PLAYING = 2,
}


export interface GameRoomType {
    id: string;
    roomName: string;
    hostName: string;

    clients: string[];
    clientNicknames: string[],
    clientBoards: number[][][]
    clientReady: boolean[]

    gameState: number,

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
    clientNicknames: [],
    clientBoards: [],
    gameState: GameStage.WAITING,
    clientReady: [],

    hasPassword: false,
    password: '',
}

export const RoomContext = createContext<RoomContextProps>({
    room: {
        id: '',
        roomName: '',
        hostName: '',
        clients: [],
        clientNicknames: [],
        clientBoards: [],
        gameState: GameStage.WAITING,
        clientReady: [],
    
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
