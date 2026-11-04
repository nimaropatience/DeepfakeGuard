import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Detect from "./pages/Detect";
import Live from "./pages/Live";
import History from "./pages/History";
import Models from "./pages/Models";
import About from "./pages/About";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/detect", element: <Detect /> },
      { path: "/live", element: <Live /> },
      { path: "/history", element: <History /> },
      { path: "/history/:id", element: <Detect /> },
      { path: "/models", element: <Models /> },
      { path: "/about", element: <About /> },
    ],
  },
]);
