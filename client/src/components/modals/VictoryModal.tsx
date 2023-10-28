import { useContext } from 'react'
import { UserContext } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom';

type Props = {
  userId: string,
  victoryMessage: string,
  closePopup: () => void;
}

const VictoryModal = ({userId, closePopup}: Props) => {
  const navigate = useNavigate();

  const {user} = useContext(UserContext);

  const handleOk = () => {
    closePopup();
    navigate('/rooms');
  }

  const handleStay = () => {
    closePopup();
  }

  return (
    <div className="victory">
      <h1 className="victory__titile">
        {userId === user.sessionId ? "You have WON!" : "You have lost!"}
      </h1>
      <div className="victory__buttons">
        <button className='g__button' onClick={handleOk} >Leave</button>
        <button className='g__button' onClick={handleStay}>Stay to chat</button>
      </div>
    </div>
  )
}

export default VictoryModal