import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RouterProvider, Outlet, createBrowserRouter } from "react-router-dom";
import Home from './components/Home';
import Game from './views/Game';

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
])

function App() {

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
