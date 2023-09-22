import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.scss";
import { RoomProvider } from "./context/RoomContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { AlertProvider } from "./hooks/useAlert.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RoomProvider>
			<UserProvider>
				<AlertProvider>
					<App />
				</AlertProvider>
			</UserProvider>
		</RoomProvider>
	</React.StrictMode>
);

//TODO
// timer for each round
