import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RouterProvider, Outlet, createBrowserRouter } from "react-router-dom";
import Home from './components/Home';
import Game from './views/Game';
import Signin from './views/Signin';
import Signup from './views/Signup';
import Rooms from './views/Rooms';
import GameRoom from './views/GameRoom';

export const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/game",
        element: <Game />
      },
      {
        path: "/rooms",
        element: <Rooms />
      },
      {
        path: "/room/:roomId",
        element: <GameRoom />
      }
    ]
  },
  {
    path: "/signin",
    element: <Signin />
  },
  {
    path: "/signup",
    element: <Signup />
  },
])

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  )
}


//TODO
//make rooms switch their ownership upon host leaving
// after that start implementing actual gameplay into rooms, everything else is working i think

export default App

