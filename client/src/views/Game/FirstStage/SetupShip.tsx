import React from 'react'

type Props = {
    shipType: "carrier" | "battleship" | "cruiser" | "destroyer"
}

const SetupShip = ({ shipType }: Props) => {

    return (
        <div
            className={`ship ${"--" + shipType}`}
            draggable
        >
        </div>
    )
}

export default SetupShip