import { useState } from "react";
import { useDrag } from "react-dnd";
import { usePreview } from "react-dnd-preview";
import { ShipType, ShipTypeConst } from "./ShipPlacement";

type Props = {
	shipType: ShipType;
	isFlipped: boolean;
    shipDndType: "Carrier" | "Battleship" | "Cruiser" | "Destroyer";
};

const Ship = ({ shipType, isFlipped, shipDndType }: Props) => {
	const [, drag] = useDrag(() => ({
		type: ShipTypeConst.BATTLESHIP || ShipTypeConst.CARRIER || ShipTypeConst.CRUISER || ShipTypeConst.DESTROYER,
		item: { shipDndType, shipType },
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	}));

	const MyPreview = () => {
		const preview = usePreview();

		const { display, item, style }: any = preview;

		if (!display) {
			return null;
		}

		const { shipType } = item;
		const elem = <div className={`ship --${shipType}`} style={{ opacity: 0.5 }}></div>;
		return (
			<div className='item-list__item' style={style}>
				{elem}
			</div>
		);
	};

	const [isDragged, setIsBeingDragged] = useState(false);

	const dragStart = () => {
		setIsBeingDragged(true);
	};

	const dragEnd = () => {
		setIsBeingDragged(false);
	};

	const onTouchStart = () => {
		dragStart();
	};

	const onTouchEnd = () => {
		dragEnd();
	};

	return (
		<>
			<MyPreview />
			<div
				ref={drag}
				className={`ship ${isDragged ? "beingDragged" : ""} --${shipType} ${isFlipped ? "--flipped" : ""}`}
				id={shipType.toString()}
				onDragStart={() => dragStart()}
				onDragEnd={() => dragEnd()}
				onTouchStart={() => onTouchStart()}
				onTouchEnd={() => onTouchEnd()}
			>
				{shipType}
			</div>
		</>
	);
};

export default Ship;
