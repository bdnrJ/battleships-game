import { useState, useEffect } from 'react';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';

type MessageType = 'success' | 'failure';

interface MessagePopupProps {
  message: string;
  type: MessageType;
  onClose: () => void,
}

const MessageAlert = ({ message, type, onClose }: MessagePopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {

    //Beautifull hack to make sliding animation work :)
    setTimeout(() => {
      setIsVisible(true);
    }, 0)

    const timeout = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, type === 'failure' ? 6000 : 3000); // Hide the popup after 6 seconds
    return () => clearTimeout(timeout);
  }, []);

  const getIcon = () => {
    if (type === 'success') {
      return <AiOutlineCheck />;
    }
    return <AiOutlineClose />;
  };

  const popupClassName = `message-popup ${type} ${isVisible ? 'visible' : ''}`;

  return (
    <div className={popupClassName} onClick={() => onClose()} >
      <div className="popup-content">
        <div className="icon">{getIcon()}</div>
        <div className="popup-message">{message}</div>
      </div>
    </div>
  );
};

export default MessageAlert;
