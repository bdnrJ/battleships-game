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

    const onTouchStart = (e: any) => {
        dragStart();
    }
    
    const onTouchEnd = (e: any) => {
        console.log(e);
        dragEnd();
    }

    return (
        <div 
            className={`ship ${isDragged ? "beingDragged" : ""}`}
            draggable
            style={ isFlipped ? {height: shipLength} : {width: shipLength}}
            id={shipType.toString()}
            onDragStart={() => dragStart()}
            onDragEnd={() => dragEnd()}
            onTouchStart={(e) => onTouchStart(e)}
            onTouchEnd={(e) => onTouchEnd(e)}
        >
            {shipType}
        </div>
    )
}

export default Ship