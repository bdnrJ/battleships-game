import { createContext, useContext, useState, ReactNode } from "react";
import MessageAlert from "../components/modals/MessageAlert";

type AlertType = "success" | "failure";

type AlertContextType = {
	showAlert: (message: string, type: AlertType) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error("usePopup must be used within a PopupProvider");
	}
	return context;
};

type PopupProviderProps = {
	children: ReactNode;
};

export const AlertProvider = ({ children }: PopupProviderProps) => {
	const [popupInfo, setPopupInfo] = useState<{ message: string; type: AlertType } | null>(null);

	const showAlert = (message: string, type: AlertType) => {
		setPopupInfo({ message, type });
	};

	const closeAlert = () => {
		setPopupInfo(null);
	};

	return (
		<AlertContext.Provider value={{ showAlert }}>
			{children}
			{popupInfo && <MessageAlert message={popupInfo.message} type={popupInfo.type} onClose={closeAlert} />}
		</AlertContext.Provider>
	);
};
