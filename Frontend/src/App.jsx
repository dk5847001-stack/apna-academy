import { BrowserRouter } from "react-router-dom";

import AuthNavbarSync from "./components/AuthNavbarSync";
import NavbarFunctionality from "./components/NavbarFunctionality";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <NavbarFunctionality />
      <AuthNavbarSync />
      <AppRoutes />
    </BrowserRouter>
  );
}
