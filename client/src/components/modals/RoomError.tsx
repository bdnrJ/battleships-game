import { useNavigate } from "react-router-dom";

type Props = {
  handleClose: () => void;
  errMessage: string,
}

const RoomError = ({handleClose, errMessage}: Props) => {

  const navigate = useNavigate();

  const handleGoToRooms = () => {
    navigate('/rooms');
    handleClose();
  }

  return (
    <div className="enemyleft">
      <div className="enemyleft--title">
        {errMessage}
      </div>
      <button className="g__button" onClick={handleGoToRooms} aria-label='ok'>
        OK
      </button>
    </div>
  )
}

export default RoomError