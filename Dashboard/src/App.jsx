import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import SeoGuard from "./components/SeoGuard";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SeoGuard />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
