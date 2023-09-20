
type Props = {
	value: number;
  wasHit: boolean,
};

const MyCell = ({ value, wasHit }: Props) => {
	return (
		<div
			className={`mycell ${
				value === 1
					? "--destroyer"
					: value === 2
					? "--cruiser"
					: value === 3
					? "--battleship"
					: value === 4
					? "--carrier"
					: ""
			} ${value === 6 && "--dead"} ${wasHit && "--hitted"}`}
		>
			
		</div>
	);
};

export default MyCell;
