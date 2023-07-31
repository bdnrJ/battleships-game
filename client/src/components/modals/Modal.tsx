import React, { useEffect } from 'react';
import {AiOutlineClose} from 'react-icons/ai'

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose]);

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal__overlay" onClick={handleOverlayClick}>
            <div className="modal__content">
                <div className="modal__content--upper">
                    <button className="modal--close--button" onClick={onClose}>
                        <AiOutlineClose />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
