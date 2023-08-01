import { createContext,Dispatch,ReactNode, SetStateAction, useEffect, useState } from "react";
import axiosClient from "../axios-client";

type Props = {
    children: ReactNode,
}

export type GameRoom = {
    id: string,
    roomName: string,
    hostName: string,
    hasPassword: boolean,
    password: string,
    clients: string[]
}

interface RoomContextProps{
    room: GameRoom,
    setRoom: Dispatch<SetStateAction<GameRoom>>
}

const defaultRoom: GameRoom = {
    id: "",
    roomName: "",
    hostName: "",
    hasPassword: false,
    password: "",
    clients: []
}

export const RoomContext = createContext<RoomContextProps>({
    room: {
        id: "",
        roomName: "",
        hostName: "",
        hasPassword: false,
        password: "",
        clients: [],
    },
    setRoom: () => {}
})

export const RoomProvider = ({children}: Props) => {
    const [room, setRoom] = useState<GameRoom>(defaultRoom);

    return (
        <RoomContext.Provider value={{room, setRoom}}>
            {children}
        </RoomContext.Provider>
    )
}
