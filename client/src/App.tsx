import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RouterProvider, Outlet, createBrowserRouter } from "react-router-dom";
import Home from './components/Home';
import Game from './views/Game';
import Signin from './views/Signin';
import Signup from './views/Signup';

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

export default App
