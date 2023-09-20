import {useState} from 'react'

type Props ={
    shipType: number,
    isFlipped: boolean
}



const Ship = ({shipType, isFlipped}: Props) => {
    const shipLength = shipType*40;

    const [isDragged, setIsBeingDragged] = useState(false);

    const dragStart = () => {
        setIsBeingDragged(true);
    }

    const dragEnd = () => {
        setIsBeingDragged(false);
    }

    return (
        <div 
            className={`ship ${isDragged ? "beingDragged" : ""}`}
            draggable
            style={ isFlipped ? {height: shipLength} : {width: shipLength}}
            id={shipType.toString()}
            onDragStart={() => dragStart()}
            onDragEnd={() => dragEnd()}
        >
            {shipType}
        </div>
    )
}

export default Ship