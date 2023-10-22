import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer";
import { RouterProvider, Outlet, createBrowserRouter } from "react-router-dom";
import Signin from "./views/Signin";
import Signup from "./views/Signup";
import Rooms from "./views/Rooms";
import GameRoom from "./views/GameRoom";
import { CenterModalProvider } from "./hooks/useCenterModal";
import QuickGame from "./views/QuickGame";
import Invite from "./views/Invite";
import MyGames from "./views/MyGames";

export const Layout = () => {
	return (
		<div className='layout'>
			<Navbar />
			<Outlet />
			<Footer />
		</div>
	);
};

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<CenterModalProvider>
				<Layout />
			</CenterModalProvider>
		),
		children: [
			{
				path: "/",
				element: <Rooms />,
			},
			{
				path: "/rooms",
				element: <Rooms />,
			},
			{
				path: "/findgame",
				element: <QuickGame />,
			},
			{
				path: "/my_games",
				element: <MyGames />,
			},
		],
	},
	{
		path: "/room/:roomId",
		element: (
			<CenterModalProvider>
				<GameRoom />
			</CenterModalProvider>
		),
	},
	{
		path: "/signin",
		element: <Signin />,
	},
	{
		path: "/signup",
		element: <Signup />,
	},
	{
		path: "/invite/:id",
		element: (
			<CenterModalProvider>
				<Invite />,
			</CenterModalProvider>
		),
	},
]);

function App() {
	return (
		<div className='App'>
			<RouterProvider router={router} />
		</div>
	);
}

//TODO
// after that start implementing actual gameplay into rooms, everything else is working i think

export default App;
