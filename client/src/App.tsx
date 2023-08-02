import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RouterProvider, Outlet, createBrowserRouter } from "react-router-dom";
import Home from './components/Home';
import Game from './views/Game';
import Signin from './views/Signin';
import Signup from './views/Signup';
import Rooms from './views/Rooms';
import GameRoom from './views/GameRoom';
import { getCookie, setCookie } from './utils/cookies';
import { v4 as uuidv4 } from 'uuid';

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

  if(!getCookie('anonNickname')){
    setCookie('anonNickname', `Anon-${uuidv4().substr(0, 8)}`, 999);
  }

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  )
}

export default App

