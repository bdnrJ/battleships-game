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

import {QueryClient, QueryClientProvider } from "@tanstack/react-query";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const backend = isMobile ? TouchBackend : HTML5Backend;

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RoomProvider>
				<UserProvider>
					<AlertProvider>
						<DndProvider backend={backend}>
							<App />
						</DndProvider>
					</AlertProvider>
				</UserProvider>
			</RoomProvider>
		</QueryClientProvider>
	</React.StrictMode>
);

//TODO
//recreate timer to work from backend
// when game ended different communicate when enemy leaves ;d fix on backend
