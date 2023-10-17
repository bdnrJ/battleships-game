type Props = {
	handleClose: () => void;
	leaveRoom: () => void;
};

const AcceptLeavingRoom = ({ handleClose, leaveRoom }: Props) => {
	return (
		<div className='enemyleft'>
			<div className='enemyleft--title'>Are you sure you want to leave the game?</div>
			<div className="enemyLeft__buttons">
        <button
          className='g__button g__uppercase'
          onClick={() => {
            handleClose();
            leaveRoom();
          }}
          aria-label='ok'
        >
          yes
        </button>
        <button className='g__button g__uppercase' onClick={handleClose} aria-label='ok'>
          cancel
        </button>
      </div>
		</div>
	);
};

export default AcceptLeavingRoom;
