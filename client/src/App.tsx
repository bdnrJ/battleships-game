import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RouterProvider, Outlet, createBrowserRouter } from "react-router-dom";
import Home from './components/Home';

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
