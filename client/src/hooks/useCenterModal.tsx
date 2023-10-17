import { createContext, useContext, useState, ReactNode } from "react";
import Modal from "../components/modals/Modal";

type CenterModalContextType = {
    showCenterModal: (content: ReactNode, customOnClose?: () => void) => void;
    closePopup: () => void;
};

export const CenterModalContext = createContext<CenterModalContextType | undefined>(undefined);

export const useCenterModal = () => {
    const context = useContext(CenterModalContext);
    if (!context) {
        throw new Error("usePopup must be used within a PopupProvider");
    }

		return context;
};

type PopupProviderProps = {
    children: ReactNode;
};

export const CenterModalProvider = ({ children }: PopupProviderProps) => {
    const [popupInfo, setPopupInfo] = useState<{ content: ReactNode; customOnClose?: () => void } | null>(null);

    const showCenterModal = (content: ReactNode, customOnClose?: () => void) => {
        setPopupInfo({ content, customOnClose });
    };

    const closePopup = () => {
        if (popupInfo?.customOnClose) {
            popupInfo.customOnClose();
        }
        setPopupInfo(null);
    };

    return (
        <CenterModalContext.Provider value={{ showCenterModal, closePopup }}>
            {children}
            {popupInfo && <Modal onClose={closePopup}>{popupInfo.content}</Modal>}
        </CenterModalContext.Provider>
    );
};
