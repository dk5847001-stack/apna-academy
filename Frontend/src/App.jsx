import { BrowserRouter } from "react-router-dom";

import AuthNavbarSync from "./components/AuthNavbarSync";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthNavbarSync />
      <AppRoutes />
    </BrowserRouter>
  );
}
