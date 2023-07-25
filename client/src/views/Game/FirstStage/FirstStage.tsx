import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import SetupBoard from './SetupBoard'
import SetupShip from './SetupShip'

type Props = {
    board: number[][]
    setBoard: Dispatch<SetStateAction<number[][]>>,
}

const FirstStage = ({ board, setBoard }: Props) => {
    return (
        <div className="firststage">
            <div className="firststage--bullshit">

            </div>
            <div className="firststage--board">
                <SetupBoard board={board} setBoard={setBoard} />
            </div>
            <div className="firstage--ships">
                <SetupShip shipType='carrier'/>
                <SetupShip shipType='battleship'/>
                <SetupShip shipType='cruiser'/>
                <SetupShip shipType='destroyer'/>
            </div>
        </div>
    )
}

export default FirstStage