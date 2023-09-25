import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.scss";
import { RoomProvider } from "./context/RoomContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { AlertProvider } from "./hooks/useAlert.tsx";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const backend = isMobile ? TouchBackend : HTML5Backend;

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RoomProvider>
			<UserProvider>
				<AlertProvider>
					<DndProvider backend={backend}>
						<App />
					</DndProvider>
				</AlertProvider>
			</UserProvider>
		</RoomProvider>
	</React.StrictMode>
);

//TODO
// timer for each round
