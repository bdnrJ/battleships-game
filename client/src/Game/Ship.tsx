import React, {useState} from 'react'

type Props ={
    shipType: number,
    isFlipped: boolean
}



const Ship = ({shipType, isFlipped}: Props) => {
    const shipLength = shipType*40;

    const [isDragged, setIsBeingDragged] = useState(false);

    const dragStart = (e: any) => {
        setIsBeingDragged(true);
    }

    const dragEnd = (e:any) => {
        setIsBeingDragged(false);
    }

    return (
        <div 
            className={`ship ${isDragged ? "beingDragged" : ""}`}
            draggable
            style={ isFlipped ? {height: shipLength} : {width: shipLength}}
            id={shipType.toString()}
            onDragStart={(e) => dragStart(e)}
            onDragEnd={(e) => dragEnd(e)}
        >
            {shipType}
        </div>
    )
}

export default Ship